import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Loader2, Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { filmSrc, type Film } from '../data/films'
import { gsap, prefersReducedMotion, isNarrow } from '../lib/gsap'

interface Props {
  film: Film
  /** Лицевая сторона карточки, из которой «разворачивается» плеер */
  origin: HTMLElement
  /** Слои трансформаций карточки (pose / enter / exit) — для расчёта поворота и масштаба */
  transforms: HTMLElement[]
  onClosed: () => void
}

const fmt = (t: number) => {
  if (!Number.isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Геометрия карточки без учёта поворота: центр, размер, угол, радиус */
function measure(origin: HTMLElement, transforms: HTMLElement[]) {
  const r = origin.getBoundingClientRect()
  let scale = 1
  let rotation = 0
  for (const el of transforms) {
    scale *= Number(gsap.getProperty(el, 'scale')) || 1
    rotation += Number(gsap.getProperty(el, 'rotation')) || 0
  }
  const w = origin.offsetWidth * scale
  const h = origin.offsetHeight * scale
  const radius = parseFloat(getComputedStyle(origin).borderTopLeftRadius) * scale
  return { left: r.left + r.width / 2 - w / 2, top: r.top + r.height / 2 - h / 2, width: w, height: h, rotation, borderRadius: radius }
}

/** Целевая рамка: максимально крупно с сохранением пропорций видео */
function targetBox(aspect: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const narrow = isNarrow()
  const pad = narrow ? 10 : 32
  const maxW = vw - pad * 2
  const maxH = vh - pad * 2 - (narrow ? 0 : 0)
  let w = maxW
  let h = w / aspect
  if (h > maxH) {
    h = maxH
    w = h * aspect
  }
  return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h, rotation: 0, borderRadius: narrow ? 14 : 18 }
}

export function CinematicVideoPlayer({ film, origin, transforms, onClosed }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const posterRef = useRef<HTMLImageElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const chrome = useRef<HTMLDivElement>(null)
  const info = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const closing = useRef(false)
  const opened = useRef(false)
  const idleTimer = useRef<number>(0)

  const [paused, setPaused] = useState(true)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(film.duration ?? 0)
  const [buffering, setBuffering] = useState(true)
  const [error, setError] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [fs, setFs] = useState(false)
  const [idle, setIdle] = useState(false)

  const tryPlay = useCallback(async () => {
    const v = video.current
    if (!v) return
    try {
      await v.play()
      setNeedsTap(false)
    } catch {
      // браузер запретил автозапуск со звуком — покажем крупную кнопку
      setNeedsTap(true)
    }
  }, [])

  // Блокируем прокрутку страницы без сдвига макета
  useLayoutEffect(() => {
    const sbw = window.innerWidth - document.documentElement.clientWidth
    document.documentElement.classList.add('is-locked')
    document.body.style.paddingRight = sbw ? `${sbw}px` : ''
    return () => {
      document.documentElement.classList.remove('is-locked')
      document.body.style.paddingRight = ''
    }
  }, [])

  // Открытие: карточка отделяется от колоды и разворачивается в плеер
  useLayoutEffect(() => {
    const from = measure(origin, transforms)
    const to = targetBox(film.aspectRatio)
    const reduce = prefersReducedMotion()
    gsap.set(origin, { visibility: 'hidden' })
    gsap.set(frame.current, { ...from, transformOrigin: '50% 50%' })
    gsap.set([chrome.current, info.current], { autoAlpha: 0 })

    const tl = gsap.timeline({
      onComplete: () => {
        opened.current = true
        closeBtn.current?.focus({ preventScroll: true })
        tryPlay()
      },
    })
    if (reduce) {
      tl.set(frame.current, to).fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }).to([chrome.current, info.current], { autoAlpha: 1, duration: 0.2 })
    } else {
      tl.fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 0)
        .to(frame.current, { scale: 1.04, y: -10, rotation: from.rotation * 0.6, duration: 0.24, ease: 'power2.out' }, 0)
        .to(frame.current, { ...to, scale: 1, y: 0, duration: 0.95, ease: 'expo.inOut' }, 0.16)
        .to(info.current, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 0.75)
        .fromTo(info.current?.querySelectorAll('[data-line]') ?? [], { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, 0.75)
        .to(chrome.current, { autoAlpha: 1, duration: 0.4 }, 0.95)
    }
    return () => {
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Закрытие: обратная хореография — плеер сворачивается обратно в карточку
  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    const v = video.current
    v?.pause()
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    const reduce = prefersReducedMotion()
    const to = measure(origin, transforms)
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(origin, { visibility: 'visible' })
        onClosed()
      },
    })
    if (reduce) {
      tl.to(root.current, { autoAlpha: 0, duration: 0.25 })
      return
    }
    tl.to([chrome.current, info.current], { autoAlpha: 0, duration: 0.25 }, 0)
      .to(posterRef.current, { autoAlpha: 1, duration: 0.35 }, 0)
      .to(frame.current, { ...to, duration: 0.85, ease: 'expo.inOut' }, 0.12)
      .to(backdrop.current, { autoAlpha: 0, duration: 0.7, ease: 'power2.inOut' }, 0.25)
  }, [origin, transforms, onClosed])

  const togglePlay = useCallback(() => {
    const v = video.current
    if (!v || !opened.current) return
    if (v.paused) tryPlay()
    else v.pause()
  }, [tryPlay])

  const toggleFs = useCallback(() => {
    const el = frame.current as HTMLDivElement & { webkitRequestFullscreen?: () => void }
    const v = video.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => v.webkitEnterFullscreen?.())
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    else v.webkitEnterFullscreen?.()
  }, [])

  const seekBy = (d: number) => {
    const v = video.current
    if (v && Number.isFinite(v.duration)) v.currentTime = Math.min(Math.max(0, v.currentTime + d), v.duration)
  }

  // Клавиатура и фокус-ловушка
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          e.preventDefault()
          close()
        }
        return
      }
      const tag = (e.target as HTMLElement).tagName
      if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'INPUT') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowRight' && tag !== 'INPUT') seekBy(5)
      else if (e.key === 'ArrowLeft' && tag !== 'INPUT') seekBy(-5)
      else if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'а') toggleFs()
      else if (e.key === 'Tab' && root.current) {
        const items = [...root.current.querySelectorAll<HTMLElement>('button, input, [tabindex="0"]')].filter((el) => el.offsetParent !== null)
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const onFs = () => setFs(Boolean(document.fullscreenElement))
    const onResize = () => {
      if (opened.current && !closing.current && !document.fullscreenElement) gsap.set(frame.current, targetBox(film.aspectRatio))
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFs)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onFs)
      window.removeEventListener('resize', onResize)
    }
  }, [close, togglePlay, toggleFs, film.aspectRatio])

  // Автоскрытие элементов управления во время просмотра
  const wake = () => {
    setIdle(false)
    window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setIdle(true), 2600)
  }
  useEffect(() => () => window.clearTimeout(idleTimer.current), [])

  const progress = duration ? (time / duration) * 100 : 0
  const showChrome = paused || !idle || error || needsTap

  return createPortal(
    <div ref={root} role="dialog" aria-modal="true" aria-label={`Ролик ${film.number}: ${film.title}`} className="fixed inset-0 z-[200]" onMouseMove={wake} onTouchStart={wake}>
      <div ref={backdrop} className="absolute inset-0 bg-[#120a06]/[0.97]" onClick={close} />

      {/* Информация о ролике — на широких экранах слева от вертикального видео */}
      <div ref={info} className="pointer-events-none absolute left-[4vw] top-1/2 hidden max-w-[min(28vw,420px)] -translate-y-1/2 text-cream lg:block">
        <p className="line-mask text-sm text-cream/60"><span data-line>Ролик {film.number} / 04</span></p>
        <h2 className="display mt-3 text-[clamp(3.2rem,5.6vw,6.5rem)]">
          {film.titleLines.map((l, k) => (
            <span key={k} className="line-mask"><span data-line>{l}</span></span>
          ))}
        </h2>
        <p className="line-mask serif-accent mt-4 text-2xl text-gold-soft"><span data-line>{film.subtitle}</span></p>
        <p className="mt-8 text-xs leading-relaxed text-cream/45">
          Пробел — пауза · ← → — перемотка · F — полный экран · Esc — закрыть
        </p>
      </div>

      <div ref={frame} className="absolute overflow-hidden bg-black shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]" style={{ left: 0, top: 0, width: 0, height: 0 }}>
        <video
          ref={video}
          src={filmSrc(film)}
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full bg-black object-contain"
          onClick={togglePlay}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onPlaying={() => {
            setBuffering(false)
            gsap.to(posterRef.current, { autoAlpha: 0, duration: 0.5 })
          }}
          onWaiting={() => setBuffering(true)}
          onCanPlay={() => setBuffering(false)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onVolumeChange={(e) => {
            setMuted(e.currentTarget.muted)
            setVolume(e.currentTarget.volume)
          }}
          onEnded={() => {
            setIdle(false)
            gsap.to(posterRef.current, { autoAlpha: 0.0, duration: 0.3 })
          }}
          onError={() => {
            setError(true)
            setBuffering(false)
          }}
        />
        <img ref={posterRef} src={film.poster.src} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ objectPosition: film.posterPosition }} />

        <div ref={chrome} className={`absolute inset-0 transition-opacity duration-500 ${showChrome ? 'opacity-100' : 'opacity-0'}`} style={{ cursor: showChrome ? 'auto' : 'none' }}>
          {/* мобильная подпись */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent lg:hidden" />
          <p className="pointer-events-none absolute left-4 top-4 pr-16 text-cream lg:hidden">
            <span className="text-xs text-cream/70">Ролик {film.number}</span>
            <span className="display block text-3xl">{film.title}</span>
          </p>

          {(buffering || error || needsTap) && (
            <div className="absolute inset-0 grid place-items-center">
              {error ? (
                <div className="mx-6 max-w-xs rounded-2xl bg-ink/90 p-5 text-center text-cream">
                  <AlertTriangle className="mx-auto size-6 text-gold-soft" />
                  <p className="mt-3 text-sm">Не удалось загрузить видео. Проверьте подключение или путь к файлу.</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-semibold text-ink"
                    onClick={() => {
                      setError(false)
                      setBuffering(true)
                      video.current?.load()
                      tryPlay()
                    }}
                  >
                    <RotateCcw className="size-4" /> Повторить
                  </button>
                </div>
              ) : needsTap ? (
                <button type="button" onClick={tryPlay} aria-label="Воспроизвести" className="grid size-20 place-items-center rounded-full bg-cream text-ink shadow-xl transition-transform hover:scale-105">
                  <Play className="ml-1 size-8 fill-current" />
                </button>
              ) : (
                opened.current && <Loader2 className="size-9 animate-spin text-cream/80" aria-label="Загрузка" />
              )}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-3 pt-14 md:px-5 md:pb-4">
            <div className="flex items-center gap-2 text-[11px] tabular-nums text-cream/80">
              <span>{fmt(time)}</span>
              <input
                type="range"
                className="range flex-1"
                min={0}
                max={duration || 0}
                step={0.1}
                value={time}
                aria-label="Перемотка"
                aria-valuetext={`${fmt(time)} из ${fmt(duration)}`}
                style={{ ['--fill' as string]: `${progress}%` }}
                onChange={(e) => {
                  const v = video.current
                  if (v) v.currentTime = Number(e.target.value)
                  setTime(Number(e.target.value))
                }}
              />
              <span>{fmt(duration)}</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-cream">
              <button type="button" onClick={togglePlay} aria-label={paused ? 'Воспроизвести' : 'Пауза'} className="grid size-10 place-items-center rounded-full hover:bg-white/10">
                {paused ? <Play className="ml-0.5 size-5 fill-current" /> : <Pause className="size-5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  const v = video.current
                  if (v) v.muted = !v.muted
                }}
                aria-label={muted ? 'Включить звук' : 'Выключить звук'}
                className="grid size-10 place-items-center rounded-full hover:bg-white/10"
              >
                {muted || volume === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
              <input
                type="range"
                className="range hidden w-20 sm:block"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                aria-label="Громкость"
                style={{ ['--fill' as string]: `${(muted ? 0 : volume) * 100}%` }}
                onChange={(e) => {
                  const v = video.current
                  if (!v) return
                  v.volume = Number(e.target.value)
                  v.muted = v.volume === 0
                }}
              />
              <span className="flex-1" />
              <button type="button" onClick={toggleFs} aria-label={fs ? 'Выйти из полноэкранного режима' : 'Полный экран'} className="grid size-10 place-items-center rounded-full hover:bg-white/10">
                {fs ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        <button
          ref={closeBtn}
          type="button"
          onClick={close}
          aria-label="Закрыть плеер"
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-cream text-ink shadow-lg transition-transform hover:rotate-90 md:right-4 md:top-4"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>,
    document.body,
  )
}
