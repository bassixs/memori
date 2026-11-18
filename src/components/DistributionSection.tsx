import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { project } from '../data/project'
import { platforms, statusLabel } from '../data/distribution'
import { films } from '../data/films'
import { gsap, useGSAP } from '../lib/gsap'
import { revealLines } from '../lib/reveal'

export function DistributionSection() {
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        revealLines(heading.current)
        gsap.utils.toArray<HTMLElement>('[data-platform]').forEach((row, i) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%', once: true } })
          tl.from(row.querySelector('[data-rule]'), { scaleX: 0, transformOrigin: '0 50%', duration: 1.2, ease: 'expo.inOut' }, i * 0.05)
            .from(row.querySelectorAll('[data-pf-line]'), { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.06 }, 0.25)
        })
      })
    },
    { scope: root },
  )

  const totalLinks = films.reduce((n, f) => n + Object.values(f.publications).flat().length, 0)
  const activePlatforms = platforms.filter((p) => films.some((f) => f.publications[p.id].length > 0)).length
  const publishedFilms = films.filter((f) => platforms.every((p) => f.publications[p.id].length > 0)).length

  return (
    <section ref={root} id="distribution" data-section="Распространение" className="paper-grain relative overflow-x-clip bg-gold-soft py-24 text-ink md:py-36">
      <div className="mx-auto max-w-[1720px] px-4 md:px-[4vw]">
        <p className="eyebrow mb-6 text-choc/60">04 — Распространение</p>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          <h2 ref={heading} className="display text-[clamp(3rem,12.5vw,5rem)] lg:col-span-8 lg:text-[clamp(4.8rem,7.6vw,9.5rem)]">
            <span className="line-mask"><span data-line>От готового ролика&nbsp;—</span></span>
            <span className="line-mask pb-[0.16em] -mb-[0.1em]"><span data-line className="serif-accent normal-case text-choc-soft">к аудитории</span></span>
          </h2>
          <p className="max-w-md self-end text-[1.02rem] leading-relaxed text-choc/80 lg:col-span-4 lg:pb-3">{project.distribution.lead}</p>
        </div>

        {/* Сводка размещения — считается из ссылок в films.ts */}
        {totalLinks > 0 && (
          <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-6 md:mt-20">
            {[
              { v: project.publications, l: 'публикаций' },
              { v: activePlatforms, l: 'площадки' },
              { v: publishedFilms, l: 'ролика на каждой площадке' },
            ].map((m) => (
              <div key={m.l} className="flex items-baseline gap-3">
                <dd className="display text-[clamp(3.4rem,7vw,6rem)] leading-none tabular-nums">{String(m.v).padStart(2, '0')}</dd>
                <dt className="text-sm text-choc/70">{m.l}</dt>
              </div>
            ))}
          </dl>
        )}

        <ul className="mt-16 md:mt-24">
          {platforms.map((p, i) => {
            const links = films.filter((f) => f.publications[p.id].length > 0)
            return (
              <li key={p.id} data-platform className="group relative">
                <span data-rule className="absolute inset-x-0 top-0 h-px bg-ink/25" />
                <div className="grid grid-cols-12 items-center gap-x-4 gap-y-3 py-6 md:py-8">
                  <div className="col-span-2 overflow-hidden md:col-span-1">
                    <span data-pf-line className="block text-sm tabular-nums text-choc/60">0{i + 1}</span>
                  </div>
                  <div className="col-span-10 overflow-hidden md:col-span-6">
                    <h3 data-pf-line className="display text-[clamp(3rem,13vw,4.5rem)] md:text-[clamp(4rem,7vw,8rem)]">
                      <span className="inline-block transition-transform duration-700 ease-out-expo group-hover:translate-x-3">
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-2">
                            {p.name} <ArrowUpRight className="mt-[0.15em] size-[0.4em]" />
                          </a>
                        ) : (
                          p.name
                        )}
                      </span>
                    </h3>
                  </div>
                  <div className="col-span-10 col-start-3 overflow-hidden md:col-span-5 md:col-start-auto md:justify-self-end md:text-right">
                    <div data-pf-line>
                      <span className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-3 py-1.5 text-xs font-medium">
                        <span className={`size-1.5 rounded-full ${p.status === 'published' ? 'bg-[#3d6b3a]' : p.status === 'planned' ? 'bg-gold' : 'bg-ink/35'}`} />
                        {statusLabel[p.status]}
                      </span>
                      {links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
                          {links.map((f) => {
                            const pubs = f.publications[p.id]
                            if (pubs.length === 1) {
                              return (
                                <a key={f.id} href={pubs[0].url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-choc">
                                  {f.number} {f.short} <ArrowUpRight className="size-3" />
                                </a>
                              )
                            }
                            // несколько публикаций одного ролика (например, пост и клип ВКонтакте)
                            return (
                              <span key={f.id} className="inline-flex items-stretch overflow-hidden rounded-full bg-ink text-xs font-medium text-cream">
                                <span className="py-1.5 pl-3 pr-2">{f.number} {f.short}</span>
                                {pubs.map((pub) => (
                                  <a key={pub.url} href={pub.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 border-l border-cream/20 px-2.5 py-1.5 text-cream/80 transition-colors hover:bg-choc hover:text-cream">
                                    {pub.label} <ArrowUpRight className="size-3" />
                                  </a>
                                ))}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
