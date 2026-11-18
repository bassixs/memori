import { useRef } from 'react'
import { project } from '../data/project'
import { films } from '../data/films'
import { totals, type ImageRef } from '../lib/media'
import { gsap, useGSAP } from '../lib/gsap'
import { revealLines, revealImage } from '../lib/reveal'

const filmNo = (img: ImageRef) => films.find((f) => f.id === img.film)!.number

// Две ленты кадров, которые движутся навстречу друг другу при прокрутке
const rowA = [films[0].stills[0], films[1].stills[1], films[2].stills[0], films[3].stills[0], films[0].stills[1], films[1].stills[3], films[2].stills[3], films[3].stills[3]]
const rowB = [films[3].stills[1], films[2].stills[2], films[1].stills[0], films[0].stills[2], films[3].stills[2], films[2].stills[1], films[1].stills[2], films[0].stills[3]]
// Крупный разворот: по одному выразительному кадру на фильм
const spread = [films[0].stills[3], films[1].stills[3], films[2].stills[0], films[3].stills[0]]

const minutes = Math.floor(totals.seconds / 60)
const seconds = Math.round(totals.seconds % 60)

function Tile({ img, tall, className = '' }: { img: ImageRef; tall?: boolean; className?: string }) {
  return (
    <figure className={`shrink-0 ${className}`}>
      <div className={`overflow-hidden rounded-[16px] bg-choc ${tall ? 'aspect-[9/16]' : 'aspect-[3/4]'}`}>
        <img src={img.srcSmall} srcSet={`${img.srcSmall} 480w, ${img.src} 960w`} sizes="(max-width: 767px) 45vw, 22vw" alt={img.caption} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </div>
      <figcaption className="mt-2 flex gap-2 text-[11px] leading-snug text-choc/70">
        <span className="font-semibold tabular-nums text-choc">{filmNo(img)}</span>
        <span className="line-clamp-1">{img.caption}</span>
      </figcaption>
    </figure>
  )
}

export function ProductionGallery() {
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        revealLines(heading.current)
        gsap.from('[data-prod-lead]', { y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '[data-prod-lead]', start: 'top 88%', once: true } })

        // Разворот: кадры раскрываются через маску с разных сторон, затем расходятся по глубине
        gsap.utils.toArray<HTMLElement>('[data-spread]').forEach((el, i) => {
          revealImage(el.querySelector('[data-clip]'), { trigger: el, from: (['left', 'bottom', 'right', 'bottom'] as const)[i], delay: i * 0.08 })
          gsap.to(el, { yPercent: [-8, 6, -14, 10][i], rotation: [-2, 1.5, -1, 2.5][i], ease: 'none', scrollTrigger: { trigger: '[data-spread-wrap]', start: 'top bottom', end: 'bottom top', scrub: 1 } })
        })

        // Ленты кадров и строка качеств движутся вместе с прокруткой
        gsap.fromTo('[data-row-a]', { xPercent: 0 }, { xPercent: -28, ease: 'none', scrollTrigger: { trigger: '[data-rows]', start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
        gsap.fromTo('[data-row-b]', { xPercent: -28 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-rows]', start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
        gsap.fromTo('[data-qualities]', { xPercent: 4 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: '[data-qualities]', start: 'top bottom', end: 'bottom top', scrub: 0.6 } })

        gsap.from('[data-fact]', { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '[data-facts]', start: 'top 88%', once: true } })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="production" data-section="Реализация" className="paper-grain relative overflow-x-clip bg-paper py-24 text-ink md:py-36">
      <div className="mx-auto max-w-[1720px] px-4 md:px-[4vw]">
        <p className="eyebrow mb-6 text-choc/60">03 — Реализация</p>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          <h2 ref={heading} className="display text-[clamp(3rem,12.5vw,5rem)] lg:col-span-8 lg:text-[clamp(4.8rem,7.6vw,9.5rem)]">
            От исторической идеи&nbsp;— <span className="serif-accent normal-case text-rust">к ожившим кадрам</span>
          </h2>
          <p data-prod-lead className="max-w-md self-end text-[1.02rem] leading-relaxed text-choc/80 lg:col-span-4 lg:pb-3">
            {project.production.lead}
          </p>
        </div>

        {/* Факты, подтверждённые материалами проекта */}
        <dl data-facts className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-choc/15 pt-8 md:mt-20 md:grid-cols-4">
          {[
            { v: '04', l: 'готовых видеоролика' },
            { v: `${minutes}:${String(seconds).padStart(2, '0')}`, l: 'общий хронометраж серии' },
            { v: String(totals.images), l: 'иллюстраций-раскадровок' },
            { v: String(totals.clips), l: 'анимированных сцен' },
          ].map((f) => (
            <div key={f.l} className="overflow-hidden">
              <div data-fact>
                <dt className="sr-only">{f.l}</dt>
                <dd className="display text-[3.4rem] leading-none md:text-[5rem]">{f.v}</dd>
                <dd className="mt-2 text-sm text-choc/70">{f.l}</dd>
              </div>
            </div>
          ))}
        </dl>

        {/* Разворот: четыре фильма — одна художественная система */}
        <div data-spread-wrap className="relative mt-20 grid grid-cols-2 gap-3 md:mt-28 md:grid-cols-12 md:gap-5">
          {spread.map((img, i) => (
            <figure
              key={img.src}
              data-spread
              className={['md:col-span-3 md:mt-24', 'md:col-span-3', 'md:col-span-3 md:mt-40', 'md:col-span-3 md:mt-10'][i]}
            >
              <div data-clip className="aspect-[9/16] overflow-hidden rounded-[18px] bg-choc">
                <img src={img.srcSmall} srcSet={`${img.srcSmall} 480w, ${img.src} 960w`} sizes="(max-width: 767px) 48vw, 24vw" alt={img.caption} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
              <figcaption className="mt-3 text-xs text-choc/70">
                <span className="mr-2 font-semibold text-choc">Фильм {filmNo(img)}</span>
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Строка художественных качеств */}
      <div className="mt-24 overflow-hidden md:mt-36" aria-hidden="true">
        <p data-qualities className="display flex w-max gap-[0.4em] whitespace-nowrap text-[clamp(4rem,11vw,12rem)] text-choc">
          {project.production.qualities.map((q, i) => (
            <span key={q} className="flex items-center gap-[0.4em]">
              <span className={i % 2 ? 'serif-accent normal-case text-rust' : ''}>{q}</span>
              <span className="inline-block size-[0.18em] rounded-full bg-gold" />
            </span>
          ))}
        </p>
      </div>
      <p className="sr-only">{project.production.qualities.join(', ')}</p>

      {/* Ленты кадров */}
      <div data-rows className="mt-14 space-y-6 overflow-hidden md:mt-20 md:space-y-8">
        <div data-row-a className="flex w-max gap-4 pl-4 md:gap-6 md:pl-[4vw]">
          {rowA.map((img, i) => (
            <Tile key={img.src} img={img} tall={i % 3 === 1} className={i % 3 === 1 ? 'w-[40vw] md:w-[17vw]' : 'w-[46vw] md:w-[21vw]'} />
          ))}
        </div>
        <div data-row-b className="flex w-max gap-4 md:gap-6">
          {rowB.map((img, i) => (
            <Tile key={img.src} img={img} tall={i % 3 === 0} className={i % 3 === 0 ? 'w-[40vw] md:w-[17vw]' : 'w-[46vw] md:w-[21vw]'} />
          ))}
        </div>
      </div>
    </section>
  )
}
