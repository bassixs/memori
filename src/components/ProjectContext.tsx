import { useRef } from 'react'
import { project } from '../data/project'
import { platforms } from '../data/distribution'
import { gsap, useGSAP } from '../lib/gsap'
import { revealLines } from '../lib/reveal'
import { Odometer } from './Odometer'

export function ProjectContext() {
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const [persons, films, platformsCount] = project.context.metrics

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        revealLines(heading.current)
        gsap.from('[data-ctx-text]', { y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '[data-ctx-text]', start: 'top 85%', once: true } })

        // Показатели: барабаны крутятся последовательно, подписи раскрываются следом
        gsap.utils.toArray<HTMLElement>('[data-metric]').forEach((m, i) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 85%', once: true }, delay: i * 0.12 })
          m.querySelectorAll<HTMLElement>('[data-odo-col]').forEach((col, k) => {
            const d = Number(col.dataset.digit)
            tl.fromTo(col, { '--d': d === 0 ? 9 : 0 }, { '--d': d, duration: 1.6 + k * 0.25, ease: 'expo.out' }, 0)
          })
          tl.from(m.querySelectorAll('[data-metric-label] > *'), { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, 0.35)
        })

        gsap.from('[data-person]', {
          xPercent: -6,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.07,
          scrollTrigger: { trigger: '[data-persons]', start: 'top 85%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="project" data-section="Основа проекта" className="paper-grain relative overflow-x-clip bg-ink text-cream">
      <div className="mx-auto max-w-[1720px] px-4 py-24 md:px-[4vw] md:py-36">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-6 text-cream/50">01 — Основа проекта</p>
            <h2 ref={heading} className="display text-[clamp(3.2rem,13vw,5rem)] lg:text-[clamp(5rem,8vw,10rem)]">
              История, рассказанная <span className="serif-accent normal-case text-gold-soft">по-новому</span>
            </h2>
          </div>
          <p data-ctx-text className="max-w-md self-end text-[1.02rem] leading-relaxed text-cream/75 lg:col-span-4 lg:pb-3">
            {project.context.text}
          </p>
        </div>

        {/* Показатели — частью редакционной композиции, с разным масштабом */}
        <div className="mt-20 grid grid-cols-12 gap-y-14 md:mt-28 md:gap-x-6">
          <div data-metric className="col-span-12 flex items-end gap-5 md:col-span-7 md:gap-8">
            <Odometer value={persons.value} className="display text-[clamp(10rem,46vw,30rem)] leading-none text-gold-soft" />
            <div data-metric-label className="line-mask mb-[0.9em] max-w-[11rem] text-lg font-medium leading-snug md:text-2xl">
              <span>{persons.label}</span>
            </div>
          </div>

          <ol data-persons className="col-span-12 self-end border-t border-cream/15 md:col-span-5 md:mb-10" aria-label="Пять личностей и номера фильмов">
            {project.context.persons.map((p) => (
              <li data-person key={p.name} className="flex items-baseline justify-between gap-4 border-b border-cream/15 py-3">
                <span className="display text-[1.9rem] md:text-[2.3rem]">{p.name}</span>
                <span className="shrink-0 text-xs text-cream/50">фильм {p.film}</span>
              </li>
            ))}
          </ol>

          <div data-metric className="col-span-7 flex flex-col items-start md:col-span-4 md:col-start-2">
            <Odometer value={films.value} className="display text-[clamp(6.5rem,28vw,17rem)] leading-none text-cream" />
            <div data-metric-label className="line-mask mt-3 text-base font-medium md:text-xl">
              <span>{films.label}</span>
            </div>
          </div>

          <div data-metric className="col-span-5 flex flex-col items-start self-end md:col-span-4 md:col-start-8">
            <Odometer value={platformsCount.value} className="display text-[clamp(4.5rem,18vw,10rem)] leading-none text-cream/40" />
            <div data-metric-label className="mt-3 text-base font-medium md:text-xl">
              <span className="line-mask"><span>{platformsCount.label}</span></span>
              <span className="line-mask mt-2 text-xs font-normal text-cream/50">
                <span>{platforms.map((p) => p.name).join(' · ')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
