import { useCallback, useEffect, useRef, useState } from 'react'
import { films } from '../data/films'
import { gsap, Draggable, ScrollTrigger, useGSAP, prefersReducedMotion, isNarrow } from '../lib/gsap'
import { deckBus } from '../lib/deckBus'
import { FilmCard } from './FilmCard'
import { DeckController } from './DeckController'
import { CinematicVideoPlayer } from './CinematicVideoPlayer'

const N = films.length

/**
 * Состояния карточки задаются её относительной позицией к активной:
 *   rel 0 — Active, 1 — Next, 2 — Background, 3 — Previous.
 * Transitioning / Playing — флаги колоды (busy / playing).
 */
type Pose = { x: number; y: number; rotation: number; scale: number; zIndex: number; shade: number }

function poseFor(rel: number, w: number, h: number): Pose {
  if (isNarrow()) {
    return [
      { x: 0, y: 0, rotation: -1.5, scale: 1, zIndex: 40, shade: 0 },
      { x: w * 0.34, y: -h * 0.03, rotation: 6, scale: 0.86, zIndex: 30, shade: 0.35 },
      { x: w * 0.58, y: -h * 0.06, rotation: 10, scale: 0.74, zIndex: 20, shade: 0.55 },
      { x: -w * 0.34, y: h * 0.02, rotation: -7, scale: 0.84, zIndex: 10, shade: 0.45 },
    ][rel]
  }
  return [
    { x: 0, y: 0, rotation: -1.5, scale: 1, zIndex: 40, shade: 0 },
    { x: w * 0.6, y: -h * 0.045, rotation: 6.5, scale: 0.8, zIndex: 30, shade: 0.3 },
    { x: w * 1.1, y: -h * 0.085, rotation: 12, scale: 0.64, zIndex: 20, shade: 0.5 },
    { x: -w * 0.5, y: h * 0.05, rotation: -8, scale: 0.72, zIndex: 10, shade: 0.55 },
  ][rel]
}

/** Тёмный оттенок фона раздела под акцент активного ролика */
const deckBg = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number, t: number) => Math.round(c * 0.62 + t * 0.38)
  const r = mix((n >> 16) & 255, 0x23), g = mix((n >> 8) & 255, 0x15), b = mix(n & 255, 0x0e)
  return `rgb(${r}, ${g}, ${b})`
}

export function FilmDeck() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const poseEls = useRef<(HTMLDivElement | null)[]>([])
  const enterEls = useRef<(HTMLDivElement | null)[]>([])
  const exitEls = useRef<(HTMLDivElement | null)[]>([])
  const faceEls = useRef<(HTMLDivElement | null)[]>([])
  const shadeEls = useRef<(HTMLDivElement | null)[]>([])
  const textEls = useRef<(HTMLDivElement | null)[]>([])
  const metaEls = useRef<(HTMLDivElement | null)[]>([])

  const st = useRef({ active: 0, busy: false, tl: null as gsap.core.Timeline | null, playing: false })
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState<number | null>(null)

  const size = () => {
    const el = stage.current!
    return { w: el.offsetWidth, h: el.offsetHeight }
  }

  const lines = (i: number) => [
    ...(textEls.current[i]?.querySelectorAll('[data-line]') ?? []),
    ...(metaEls.current[i]?.querySelectorAll('[data-line]') ?? []),
  ]
  const groups = (i: number) => [textEls.current[i], metaEls.current[i]]

  /** Мгновенно расставить всё по состоянию (первичная отрисовка, resize) */
  const layout = useCallback(() => {
    if (!stage.current) return
    const { w, h } = size()
    const a = st.current.active
    poseEls.current.forEach((el, i) => {
      const p = poseFor((i - a + N) % N, w, h)
      gsap.set(el, { x: p.x, y: p.y, rotation: p.rotation, scale: p.scale, zIndex: p.zIndex, autoAlpha: 1 })
      gsap.set(shadeEls.current[i], { opacity: p.shade })
    })
    films.forEach((_, i) => {
      gsap.set(groups(i), { autoAlpha: i === a ? 1 : 0 })
      gsap.set(lines(i), { yPercent: i === a ? 0 : 105 })
    })
    gsap.set(section.current, { '--deck-bg': deckBg(films[a].accent) })
  }, [])

  /** Хореография перехода. dir: 1 — вперёд, -1 — назад. */
  const goTo = useCallback((target: number, opts: { dir?: 1 | -1; fromDrag?: boolean } = {}) => {
    const s = st.current
    const next = ((target % N) + N) % N
    if (next === s.active || s.playing) return
    const prev = s.active
    const dir = opts.dir ?? (((next - prev + N) % N) <= N / 2 ? 1 : -1)
    const { w, h } = size()
    const reduce = prefersReducedMotion()
    const interrupted = s.busy
    s.tl?.kill()
    s.active = next
    s.busy = true
    setActive(next)

    const tl = gsap.timeline({
      onComplete: () => {
        s.busy = false
        s.tl = null
      },
    })
    s.tl = tl

    // Фон раздела
    tl.to(section.current, { '--deck-bg': deckBg(films[next].accent), duration: reduce ? 0.3 : 1.2, ease: 'power2.inOut' }, 0)

    // Текст: прежний уходит под маску вверх, новый поднимается снизу
    films.forEach((_, i) => {
      if (i !== next && i !== prev) gsap.set(groups(i), { autoAlpha: 0 })
    })
    if (reduce) {
      tl.set(groups(prev), { autoAlpha: 0 }, 0).set(lines(prev), { yPercent: 105 }, 0)
      tl.set(lines(next), { yPercent: 0 }, 0).fromTo(groups(next), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0)
    } else if (interrupted) {
      tl.set(groups(prev), { autoAlpha: 0 }, 0).set(lines(prev), { yPercent: 105 }, 0)
      tl.set(groups(next), { autoAlpha: 1 }, 0).fromTo(lines(next), { yPercent: 60 }, { yPercent: 0, duration: 0.55, ease: 'power3.out', stagger: 0.03 }, 0)
    } else {
      tl.to(lines(prev), { yPercent: -105, duration: 0.45, ease: 'power3.in', stagger: 0.035 }, 0.02)
      tl.set(groups(prev), { autoAlpha: 0 }, 0.6)
      tl.set(lines(prev), { yPercent: 105 }, 0.6)
      tl.set(groups(next), { autoAlpha: 1 }, 0.45)
      tl.fromTo(lines(next), { yPercent: 105 }, { yPercent: 0, duration: 0.95, ease: 'expo.out', stagger: 0.055 }, 0.5)
    }

    // Карточки
    poseEls.current.forEach((el, i) => {
      if (!el) return
      const fromRel = (i - prev + N) % N
      const toRel = (i - next + N) % N
      const p = poseFor(toRel, w, h)
      const to = { x: p.x, y: p.y, rotation: p.rotation, scale: p.scale }
      tl.to(shadeEls.current[i], { opacity: p.shade, duration: reduce ? 0.3 : 0.9, ease: 'power2.inOut' }, reduce ? 0 : 0.2)

      if (reduce) {
        tl.set(el, { zIndex: p.zIndex }, 0).to(el, { ...to, duration: 0.35, ease: 'power2.out' }, 0)
        return
      }
      if (interrupted) {
        tl.set(el, { zIndex: p.zIndex, autoAlpha: 1 }, 0).to(el, { ...to, duration: 0.6, ease: 'power3.out' }, 0)
        return
      }

      // Карточка, которая обходит колоду по дальнему краю: уходит в тень и появляется на новом месте
      const wraps = Math.abs(fromRel - toRel) > 1 && i !== prev && i !== next
      if (wraps) {
        tl.set(el, { zIndex: 1 }, 0)
          .to(el, { autoAlpha: 0, scale: p.scale * 0.85, duration: 0.3, ease: 'power2.in' }, 0.08)
          .set(el, { x: p.x, y: p.y + h * 0.06, rotation: p.rotation + dir * 6 }, 0.4)
          .to(el, { autoAlpha: 1, y: p.y, rotation: p.rotation, scale: p.scale, duration: 0.8, ease: 'settle' }, 0.55)
          .set(el, { zIndex: p.zIndex }, 0.55)
        return
      }

      if (i === prev) {
        // 1. приподнимается  2. уходит в сторону с поворотом, уменьшаясь и теряя глубину
        if (!opts.fromDrag) {
          tl.to(el, { y: -h * 0.025, scale: 1.035, rotation: dir > 0 ? -3.5 : 2.5, duration: 0.26, ease: 'power2.out' }, 0)
        }
        tl.to(el, { ...to, duration: 1.05, ease: 'deck' }, opts.fromDrag ? 0 : 0.18)
        tl.set(el, { zIndex: p.zIndex }, 0.5)
        return
      }
      if (i === next) {
        // 4–5. выходит из заднего плана и занимает центр
        tl.set(el, { zIndex: 35 }, 0)
        tl.to(el, { ...to, duration: 1.15, ease: 'expo.inOut' }, 0.1)
        tl.set(el, { zIndex: 50 }, 0.48)
        tl.set(el, { zIndex: p.zIndex }, 1.3)
        return
      }
      // 6. остальные перестраиваются
      tl.to(el, { ...to, duration: 1.0, ease: 'deck' }, 0.16)
      tl.set(el, { zIndex: p.zIndex }, 0.5)
    })

  }, [])

  const step = useCallback((d: 1 | -1) => goTo(st.current.active + d, { dir: d }), [goTo])

  const openFilm = useCallback(() => {
    const s = st.current
    if (s.playing) return
    s.tl?.progress(1)
    s.playing = true
    setPlaying(s.active)
  }, [])

  const onPlayerClosed = useCallback(() => {
    st.current.playing = false
    setPlaying(null)
    // 7. карточка принимает исходное положение — мягкая «посадка»
    const el = poseEls.current[st.current.active]
    if (el && !prefersReducedMotion()) {
      gsap.fromTo(el, { scale: 1.04 }, { scale: 1, duration: 0.7, ease: 'power3.out' })
    }
    stage.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    deckBus.register({ goTo: (i) => goTo(i) })
    return () => deckBus.register(null)
  }, [goTo])

  useGSAP(
    () => {
      layout()
      const onResize = () => {
        if (st.current.busy) st.current.tl?.progress(1)
        layout()
      }
      window.addEventListener('resize', onResize)

      // Перетаскивание и свайпы: прокси-элемент, вертикальная прокрутка остаётся нативной
      const proxy = document.createElement('div')
      let base = { x: 0, rotation: 0 }
      const [drag] = Draggable.create(proxy, {
        type: 'x',
        trigger: stage.current,
        allowNativeTouchScrolling: true,
        minimumMovement: 6,
        dragClickables: true,
        onPress() {
          if (st.current.playing) return
          if (st.current.busy) st.current.tl?.progress(1)
          gsap.set(proxy, { x: 0 })
          const el = poseEls.current[st.current.active]
          base = { x: Number(gsap.getProperty(el, 'x')), rotation: Number(gsap.getProperty(el, 'rotation')) }
        },
        onDrag() {
          if (st.current.playing) return
          const { w } = size()
          const dx = this.x
          const el = poseEls.current[st.current.active]
          gsap.set(el, { x: base.x + dx, rotation: base.rotation + dx * 0.025, scale: 1 - Math.min(Math.abs(dx) / w, 1) * 0.06 })
          // следующая карточка «предвкушает» движение
          const nextIdx = (st.current.active + (dx < 0 ? 1 : -1) + N) % N
          gsap.to(shadeEls.current[nextIdx], { opacity: 0.12, duration: 0.3, overwrite: 'auto' })
        },
        onRelease() {
          if (st.current.playing) return
          const { w, h } = size()
          const dx = this.x
          const threshold = Math.min(90, w * 0.2)
          if (dx < -threshold) goTo(st.current.active + 1, { dir: 1, fromDrag: true })
          else if (dx > threshold) goTo(st.current.active - 1, { dir: -1, fromDrag: true })
          else if (Math.abs(dx) > 0) {
            const a = st.current.active
            const p = poseFor(0, w, h)
            gsap.to(poseEls.current[a], { x: p.x, rotation: p.rotation, scale: 1, duration: 0.7, ease: 'power3.out' })
            films.forEach((_, i) => gsap.to(shadeEls.current[i], { opacity: poseFor((i - a + N) % N, w, h).shade, duration: 0.4 }))
          }
        },
        onClick(e: PointerEvent) {
          const card = (e.target as HTMLElement).closest('[data-index]') as HTMLElement | null
          if (!card) return
          const i = Number(card.dataset.index)
          if (i === st.current.active) openFilm()
          else goTo(i)
        },
      })

      // Сборка колоды при входе в раздел и разлёт при выходе
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const narrow = isNarrow()
        const spread = narrow ? 0.6 : 1
        gsap.fromTo(
          enterEls.current,
          {
            x: (i) => [-0.9, 0.55, 1.2, -1.35][i] * window.innerWidth * 0.32 * spread,
            y: (i) => [0.32, 0.5, 0.18, 0.42][i] * window.innerHeight,
            rotation: (i) => [-22, 16, 26, -14][i] * spread,
            scale: 0.72,
          },
          {
            x: 0, y: 0, rotation: 0, scale: 1, ease: 'none',
            scrollTrigger: { trigger: section.current, start: 'top 92%', end: 'top 18%', scrub: 0.9, invalidateOnRefresh: true },
          },
        )
        if (!narrow) {
          gsap.to(exitEls.current, {
            x: (i) => [-0.25, 0.32, 0.6, -0.55][i] * window.innerWidth * 0.4,
            y: (i) => [-0.12, -0.22, -0.3, -0.08][i] * window.innerHeight,
            rotation: (i) => [-9, 10, 16, -14][i],
            scale: 0.84,
            ease: 'none',
            scrollTrigger: { trigger: section.current, start: 'bottom 78%', end: 'bottom 10%', scrub: 0.9, invalidateOnRefresh: true },
          })
        }
      })

      return () => {
        window.removeEventListener('resize', onResize)
        drag.kill()
        mm.revert()
        ScrollTrigger.refresh()
      }
    },
    { scope: section },
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (st.current.playing) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  const film = films[active]

  return (
    <section
      id="films"
      ref={section}
      onKeyDown={onKeyDown}
      aria-roledescription="галерея"
      aria-label="Четыре ролика"
      data-section="Ролики"
      className="paper-grain relative overflow-x-clip text-cream"
      style={{ background: 'var(--deck-bg)' }}
    >
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1720px] flex-col px-4 pb-8 pt-24 md:px-[4vw] md:pb-10 md:pt-28 lg:block lg:min-h-[max(100svh,820px)]">
        {/* Заголовок раздела и счётчик */}
        <div className="relative z-[60] flex items-end justify-between gap-4 lg:absolute lg:inset-x-[4vw] lg:top-24">
          <p className="eyebrow text-cream/60">
            02 — Ролики
            <span className="ml-3 hidden text-cream/40 md:inline">листайте стрелками или свайпом · нажмите на карточку, чтобы смотреть</span>
          </p>
          <p className="display text-[2.4rem] tabular-nums md:text-[3.2rem]" aria-hidden="true">
            <span className="relative inline-grid overflow-hidden align-bottom">
              {films.map((f, i) => (
                <span key={f.id} className="col-start-1 row-start-1 transition-transform duration-700 ease-out-expo" style={{ transform: `translateY(${(i - active) * 100}%)` }}>
                  {f.number}
                </span>
              ))}
            </span>
            <span className="text-cream/35"> / {String(N).padStart(2, '0')}</span>
          </p>
        </div>

        {/* Левая колонка: имя героя, подзаголовок, описание, кнопка просмотра.
            На мобильных — display: contents, порядок задаётся через order */}
        <div className="contents lg:absolute lg:bottom-[11%] lg:left-[4vw] lg:z-[55] lg:flex lg:w-[34vw] lg:flex-col">
        <div className="pointer-events-none relative z-[55] order-1 mt-6 grid lg:mt-0">
          {films.map((f, i) => (
            <div key={f.id} ref={(el) => { textEls.current[i] = el }} className="col-start-1 row-start-1 self-end" aria-hidden={i !== active}>
              <p className="line-mask mb-2 text-sm font-medium text-cream/70 md:mb-4">
                <span data-line>Ролик {f.number}</span>
              </p>
              <h3 className="display text-[clamp(3.4rem,15vw,5.6rem)] lg:text-[clamp(4.5rem,7vw,9rem)]">
                {f.titleLines.map((l, k) => (
                  <span key={k} className="line-mask max-lg:mr-[0.22em] max-lg:inline-block">
                    <span data-line className={k === 1 && f.titleLines[1].startsWith('и ') ? 'text-gold-soft' : ''}>{l}</span>
                  </span>
                ))}
              </h3>
            </div>
          ))}
        </div>
          {/* Подзаголовок, описание и кнопка просмотра */}
          <div className="relative z-[55] order-3 lg:mt-6 lg:max-w-[min(30vw,440px)]">
            <div className="grid">
              {films.map((f, i) => (
                <div key={f.id} ref={(el) => { metaEls.current[i] = el }} className="col-start-1 row-start-1" aria-hidden={i !== active}>
                  <p className="line-mask serif-accent text-[1.6rem] leading-tight text-gold-soft md:text-[2rem]">
                    <span data-line>{f.subtitle}</span>
                  </p>
                  <p className="line-mask mt-3 hidden text-[0.95rem] leading-relaxed text-cream/75 md:block">
                    <span data-line>{f.description}</span>
                  </p>
                  <p className="line-mask mt-4 text-xs text-cream/50">
                    <span data-line>
                      {f.heroes.join(' · ')}
                      {f.duration ? ` · ${Math.floor(f.duration / 60)}:${String(Math.round(f.duration % 60)).padStart(2, '0')}` : ''}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Сцена колоды */}
        <div className="relative z-[50] order-2 my-6 flex flex-1 items-center justify-center lg:absolute lg:inset-0 lg:my-0 lg:block">
          <div
            ref={stage}
            tabIndex={0}
            role="group"
            aria-label={`Ролик ${film.number} из ${String(N).padStart(2, '0')}: ${film.title}. Стрелки влево и вправо — перелистывание, Enter — смотреть`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openFilm()
              }
            }}
            className="relative touch-pan-y select-none rounded-[22px] [--card-h:min(56svh,calc(64vw*16/9),520px)] lg:absolute lg:left-[61%] lg:top-[50%] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:[--card-h:min(70svh,760px)]"
            style={{ height: 'var(--card-h)', width: 'calc(var(--card-h) * 9 / 16)' }}
          >
            {films.map((f, i) => (
              <FilmCard
                key={f.id}
                film={f}
                index={i}
                eager={i < 2}
                active={i === active}
                setPose={(el) => { poseEls.current[i] = el }}
                setEnter={(el) => { enterEls.current[i] = el }}
                setExit={(el) => { exitEls.current[i] = el }}
                setFace={(el) => { faceEls.current[i] = el }}
                setShade={(el) => { shadeEls.current[i] = el }}
              />
            ))}
          </div>
        </div>

        {/* Управление: компактные стрелки справа под колодой */}
        <div className="relative z-[60] order-4 mt-6 flex justify-end lg:absolute lg:bottom-[9%] lg:right-[4vw] lg:mt-0">
          <DeckController onPrev={() => step(-1)} onNext={() => step(1)} />
        </div>

        <p className="sr-only" aria-live="polite">{`Ролик ${film.number} из 04: ${film.title}`}</p>
      </div>

      {playing !== null && (
        <CinematicVideoPlayer
          film={films[playing]}
          origin={faceEls.current[playing]!}
          transforms={[poseEls.current[playing]!, enterEls.current[playing]!, exitEls.current[playing]!]}
          onClosed={onPlayerClosed}
        />
      )}
    </section>
  )
}
