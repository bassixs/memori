import { useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { project } from '../data/project'
import { films } from '../data/films'
import { img } from '../lib/media'
import { gsap, SplitText, useGSAP, isNarrow } from '../lib/gsap'
import { scrollToId } from '../lib/deckBus'

/** Коллаж из кадров всех четырёх фильмов: позиция (% от области), ширина (% от области), угол, глубина */
const collage = [
  { image: films[3].poster, pos: films[3].posterPosition, x: 30, y: 6, w: 40, r: 3, z: 5, from: { x: 40, y: -120, r: 28 } },
  { image: films[0].poster, pos: films[0].posterPosition, x: 2, y: 22, w: 33, r: -9, z: 3, from: { x: -120, y: 30, r: -30 } },
  { image: films[1].poster, pos: films[1].posterPosition, x: 64, y: 18, w: 33, r: 8, z: 4, from: { x: 120, y: 10, r: 32 } },
  { image: films[2].poster, pos: films[2].posterPosition, x: 18, y: 54, w: 28, r: -4, z: 6, from: { x: -60, y: 120, r: -20 } },
  { image: img('ivan', 'ugra-1480-osennyaya-bumazhnaya-diorama-1'), pos: '50% 60%', x: 56, y: 60, w: 25, r: 6, z: 7, from: { x: 90, y: 120, r: 24 } },
]

export function HeroSection() {
  const root = useRef<HTMLElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const area = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-hero-card]')
        const wraps = gsap.utils.toArray<HTMLElement>('[data-hero-wrap]')
        const split = SplitText.create(title.current, { type: 'words,chars,lines', mask: 'lines' })
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

        // 1. Типографика раскрывается последовательными фрагментами
        tl.from(split.chars, { yPercent: 115, duration: 1.15, stagger: { each: 0.028, from: 'start' }, onComplete: () => split.revert() }, 0.05)
        tl.from('[data-hero-fade]', { yPercent: 100, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.55)

        // 2. Изображения входят с разных направлений, 3. доворачиваются и стабилизируются
        cards.forEach((card, i) => {
          const c = collage[i]
          tl.fromTo(
            card,
            { xPercent: c.from.x, yPercent: c.from.y, rotation: c.from.r, scale: 0.7, autoAlpha: 0 },
            { xPercent: 0, yPercent: 0, rotation: c.r + (i % 2 ? 4 : -4), scale: 1, autoAlpha: 1, duration: 1.25, ease: 'settle' },
            0.12 + i * 0.09,
          )
          tl.to(card, { rotation: c.r, duration: 1.1, ease: 'power3.inOut' }, 1.15 + i * 0.05)
        })

        // При прокрутке композиция перестраивается и «стекает» к колоде фильмов
        const narrow = isNarrow()
        const scrollTl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 } })
        wraps.forEach((wrap, i) => {
          const c = collage[i]
          scrollTl.to(wrap, { xPercent: ((50 - c.x - c.w / 2) / c.w) * 100 * (narrow ? 0.5 : 0.9), yPercent: 30 + i * 10, rotation: c.r * -1.6, scale: 0.86, ease: 'none' }, 0)
        })
        scrollTl.to(title.current, { yPercent: -18, ease: 'none' }, 0)
        scrollTl.to('[data-hero-fade]', { autoAlpha: 0, y: -40, ease: 'none' }, 0)
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="top" data-section="Вступление" className="paper-grain relative min-h-[100svh] overflow-x-clip bg-paper">
      <div className="relative mx-auto grid min-h-[100svh] max-w-[1720px] grid-rows-[auto_1fr_auto] px-4 pb-6 pt-24 md:px-[4vw] md:pt-28 lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-6">
        {/* Заголовок */}
        <div className="relative z-10 lg:col-span-7 lg:self-center">
          <h1 ref={title} className="display text-[clamp(3.6rem,19vw,6.5rem)] text-ink lg:text-[clamp(5.5rem,10.6vw,14rem)]" aria-label={project.title}>
            <span className="block">Летопись</span>
            <span className="serif-accent block py-[0.04em] text-[0.64em] normal-case leading-[0.95] text-rust lg:pl-[0.9em]">глазами</span>
            <span className="block">губернаторов</span>
          </h1>
          <div className="mt-6 max-w-xl md:mt-10">
            <div className="overflow-hidden">
              <p data-hero-fade className="display text-[2rem] text-choc md:text-[2.8rem]">
                {project.idea.map((s, i) => (
                  <span key={s} className={i === 1 ? 'text-gold' : ''}>{s} </span>
                ))}
              </p>
            </div>
            <div className="overflow-hidden">
              <p data-hero-fade className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-choc/80 md:text-[1.05rem]">
                {project.lead}
              </p>
            </div>
          </div>
        </div>

        {/* Коллаж кадров */}
        <div ref={area} className="pointer-events-none relative z-0 mx-auto my-6 aspect-[4/3.6] w-full max-w-[560px] lg:col-span-5 lg:my-0 lg:max-w-none lg:self-center" aria-hidden="true">
          {collage.map((c, i) => (
            <div key={i} data-hero-wrap className="absolute" style={{ left: `${c.x}%`, top: `${c.y - 8}%`, width: `${c.w}%`, zIndex: c.z }}>
              <div
                data-hero-card
                className="aspect-[9/16] overflow-hidden rounded-[clamp(10px,1.2vw,20px)] bg-choc shadow-[0_28px_50px_-22px_rgba(35,21,14,0.6)]"
                style={{ transform: `rotate(${c.r}deg)` }}
              >
                <img src={c.image.srcSmall} srcSet={`${c.image.srcSmall} 480w, ${c.image.src} 960w`} sizes="(max-width: 1023px) 40vw, 18vw" alt="" className="h-full w-full object-cover" style={{ objectPosition: c.pos }} />
              </div>
            </div>
          ))}
        </div>

        {/* Нижняя строка */}
        <div className="relative z-10 flex items-end justify-between gap-4 lg:col-span-12">
          <div className="overflow-hidden">
            <p data-hero-fade className="text-xs font-medium text-choc/70 md:text-sm">{project.caption}</p>
          </div>
          <button type="button" onClick={() => scrollToId('films')} className="group inline-flex items-center gap-3 text-sm font-semibold text-ink">
            <span className="hidden sm:inline">Четыре фильма</span>
            <span className="grid size-11 place-items-center rounded-full bg-ink text-cream transition-transform duration-500 ease-out-expo group-hover:translate-y-1">
              <ArrowDown className="size-4" />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
