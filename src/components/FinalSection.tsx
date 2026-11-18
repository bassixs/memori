import { useRef } from 'react'
import { ArrowUp, Play } from 'lucide-react'
import { project } from '../data/project'
import { films } from '../data/films'
import { gsap, useGSAP, isNarrow } from '../lib/gsap'
import { revealLines } from '../lib/reveal'
import { deckBus, scrollToId } from '../lib/deckBus'

const fan = [
  { x: -1.15, y: 0.06, r: -11 },
  { x: -0.38, y: -0.02, r: -4 },
  { x: 0.38, y: -0.02, r: 4 },
  { x: 1.15, y: 0.06, r: 11 },
]

export function FinalSection() {
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        revealLines(heading.current)
        // Четыре обложки собираются из разлёта в единый веер
        const narrow = isNarrow()
        gsap.from('[data-fan]', {
          xPercent: (i) => [-140, -60, 60, 140][i] * (narrow ? 0.4 : 1),
          yPercent: (i) => [60, 90, 80, 50][i],
          rotation: (i) => [-30, -14, 16, 28][i],
          scale: 0.75,
          ease: 'none',
          scrollTrigger: { trigger: '[data-fan-wrap]', start: 'top bottom', end: 'center 60%', scrub: 0.9 },
        })
        gsap.from('[data-final-text]', { y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '[data-final-text]', start: 'top 88%', once: true } })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="final" data-section="Финал" className="paper-grain relative overflow-x-clip bg-ink text-cream">
      <div className="mx-auto max-w-[1720px] px-4 pt-24 md:px-[4vw] md:pt-36">
        <h2 ref={heading} className="display text-center text-[clamp(3.6rem,17vw,6rem)] lg:text-[clamp(6rem,12vw,15rem)]">
          <span className="line-mask"><span data-line>История</span></span>
            <span className="line-mask pb-[0.16em] -mb-[0.1em]"><span data-line className="serif-accent normal-case text-gold-soft">продолжается.</span></span>
        </h2>

        {/* Веер обложек */}
        <div data-fan-wrap className="relative mx-auto mt-14 h-[min(62vw,340px)] max-w-[900px] md:mt-20 md:h-[min(40vw,520px)]">
          {films.map((f, i) => (
            <button
              key={f.id}
              type="button"
              data-fan
              onClick={() => deckBus.show(i)}
              aria-label={`Смотреть ролик ${f.number}: ${f.title}`}
              className="group absolute left-1/2 top-0 aspect-[9/16] h-full -translate-x-1/2"
              style={{ zIndex: i === 1 || i === 2 ? 3 : 2 }}
            >
              <span
                className="absolute inset-0 block overflow-hidden rounded-[clamp(10px,1.4vw,20px)] bg-choc shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-out-expo group-hover:-translate-y-4 group-focus-visible:-translate-y-4"
                style={{ transform: `translate(${fan[i].x * 100}%, ${fan[i].y * 100}%) rotate(${fan[i].r}deg)` }}
              >
                <img src={f.poster.srcSmall} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105" style={{ objectPosition: f.posterPosition }} />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 text-left">
                  <span className="display block text-xl md:text-3xl">{f.number}</span>
                  <span className="block text-[10px] text-cream/80 md:text-xs">{f.short}</span>
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center md:mt-24">
          <p data-final-text className="text-[1.05rem] leading-relaxed text-cream/80 md:text-lg">{project.final.text}</p>
          <div data-final-text className="mt-10 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => deckBus.show()} className="group inline-flex items-center gap-3 rounded-full bg-cream py-2 pl-2 pr-6 text-ink transition-colors hover:bg-gold-soft">
              <span className="grid size-11 place-items-center rounded-full bg-ink text-cream transition-transform duration-500 ease-out-expo group-hover:scale-110">
                <Play className="ml-0.5 size-4 fill-current" />
              </span>
              <span className="font-semibold">Смотреть ролики</span>
            </button>
          </div>
        </div>

        <footer className="mt-24 flex flex-col gap-6 border-t border-cream/15 py-8 text-xs text-cream/55 md:mt-36 md:flex-row md:items-center md:justify-between">
          <p>
            <span className="display mr-3 text-xl text-cream">{project.title}</span>
          </p>
          <p>{project.region} · {project.caption}</p>
          <button type="button" onClick={() => scrollToId('top')} className="inline-flex items-center gap-2 self-start text-cream/80 hover:text-cream md:self-auto">
            Наверх <ArrowUp className="size-3.5" />
          </button>
        </footer>
      </div>
    </section>
  )
}
