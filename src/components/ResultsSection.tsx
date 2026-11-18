import { useRef } from 'react'
import { stats, total, metricMeta, type MetricKey } from '../data/stats'
import { films } from '../data/films'
import { platforms } from '../data/distribution'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'

const nf = new Intl.NumberFormat('ru-RU')
const KEYS: MetricKey[] = ['views', 'engagement', 'reach']
const fmt = (v: number, approx?: boolean) => `${approx ? '≈ ' : ''}${nf.format(v)}`

/**
 * Результаты. Показываются только реально заполненные показатели из stats.ts.
 * Пока данных нет — нейтральное состояние без цифр и пустых диаграмм.
 */
export function ResultsSection() {
  const root = useRef<HTMLElement>(null)

  const totals = KEYS.map((k) => ({ key: k, value: total(k), ...metricMeta[k] })).filter((m) => m.value !== null) as {
    key: MetricKey
    value: number
    label: string
    approx?: boolean
  }[]
  const extra = stats.extra
  const filmRows = films.filter((f) => KEYS.some((k) => stats.byFilm[f.id][k] !== null))
  const filmCols = KEYS.filter((k) => filmRows.some((f) => stats.byFilm[f.id][k] !== null))
  const maxViews = Math.max(0, ...filmRows.map((f) => stats.byFilm[f.id].views ?? 0))
  const platformRows = platforms.filter((p) => stats.byPlatform[p.id].views !== null || stats.byPlatform[p.id].placements !== null)
  const links = films.reduce((n, f) => n + Object.values(f.publications).flat().length, 0)
  const hasData = totals.length > 0 || extra.length > 0 || filmRows.length > 0 || platformRows.length > 0

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Счётчики: итоговое число уже в разметке, анимация лишь «докручивает» его
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count)
          ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => {
              const o = { v: 0 }
              gsap.to(o, {
                v: target,
                duration: 2,
                ease: 'expo.out',
                onUpdate: () => {
                  el.textContent = nf.format(Math.round(o.v))
                },
                onComplete: () => {
                  el.textContent = nf.format(target)
                },
              })
            },
          })
        })
        gsap.from('[data-res-line]', { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } })
        gsap.from('[data-bar]', { scaleX: 0, transformOrigin: '0 50%', duration: 1.4, ease: 'expo.inOut', stagger: 0.1, scrollTrigger: { trigger: '[data-film-rows]', start: 'top 80%', once: true } })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="results" data-section="Результаты" className="paper-grain relative overflow-x-clip bg-paper-deep py-24 text-ink md:py-32">
      <div className="mx-auto max-w-[1720px] px-4 md:px-[4vw]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="eyebrow text-choc/60">05 — Результаты</p>
          {stats.updatedAt && <p className="text-xs text-choc/60">Данные на {new Date(stats.updatedAt).toLocaleDateString('ru-RU')}</p>}
        </div>

        {hasData ? (
          <>
            <h2 className="display mt-6 text-[clamp(3rem,12.5vw,5rem)] lg:text-[clamp(4.8rem,7.6vw,9.5rem)]">
              <span className="line-mask"><span data-res-line>Аудитория серии</span></span>
              <span className="line-mask pb-[0.16em] -mb-[0.1em]"><span data-res-line className="serif-accent normal-case text-choc-soft">в цифрах</span></span>
            </h2>

            {/* Итоги: главный показатель крупно, остальные — рядом */}
            {(totals.length > 0 || extra.length > 0) && (
              <dl className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 border-t border-ink/20 pt-10 sm:grid-cols-2 md:mt-20 lg:grid-cols-12">
                {totals.map((m, i) => (
                  <div key={m.key} className={i === 0 ? 'sm:col-span-2 lg:col-span-6' : 'lg:col-span-3 lg:self-end'}>
                    <dd className={`display leading-[0.85] tabular-nums ${i === 0 ? 'text-[clamp(5rem,15vw,13rem)]' : 'text-[clamp(3.4rem,6vw,6rem)]'}`}>
                      {m.approx && <span className="text-choc-soft">≈&nbsp;</span>}
                      <span data-count={m.value}>{nf.format(m.value)}</span>
                    </dd>
                    <dt className="mt-3 text-sm text-choc/70 md:text-base">{m.label}</dt>
                  </div>
                ))}
                {extra.map((m) => (
                  <div key={m.label} className="lg:col-span-3 lg:self-end">
                    <dd className="display text-[clamp(3.4rem,6vw,6rem)] leading-[0.85] tabular-nums">
                      {m.prefix}
                      <span data-count={m.value}>{nf.format(m.value)}</span>
                      {m.suffix}
                    </dd>
                    <dt className="mt-3 text-sm text-choc/70 md:text-base">{m.label}</dt>
                  </div>
                ))}
              </dl>
            )}

            {/* По роликам: строки с пропорциональной шкалой просмотров */}
            {filmRows.length > 0 && (
              <div data-film-rows className="mt-16 md:mt-24">
                <div className="hidden grid-cols-12 gap-6 pb-3 text-xs text-choc/60 md:grid">
                  <span className="col-span-5">Ролик</span>
                  {filmCols.map((k) => (
                    <span key={k} className="col-span-2 text-right">{metricMeta[k].short}</span>
                  ))}
                </div>
                <ul>
                  {filmRows.map((f) => {
                    const s = stats.byFilm[f.id]
                    return (
                      <li key={f.id} className="border-t border-ink/20 py-5 md:py-6">
                        <div className="grid grid-cols-12 items-baseline gap-x-6 gap-y-3">
                          <div className="col-span-12 flex items-baseline gap-3 md:col-span-5">
                            <span className="text-sm tabular-nums text-choc/60">{f.number}</span>
                            <span className="display text-[2.2rem] md:text-[2.8rem]">{f.title}</span>
                          </div>
                          {filmCols.map((k) => (
                            <div key={k} className="col-span-4 md:col-span-2 md:text-right">
                              <span className="block text-[11px] text-choc/60 md:hidden">{metricMeta[k].short}</span>
                              <span className="display text-[1.9rem] tabular-nums md:text-[2.4rem]">
                                {s[k] !== null ? fmt(s[k]!, metricMeta[k].approx) : '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                        {s.views !== null && maxViews > 0 && (
                          <div className="mt-4 h-[3px] overflow-hidden rounded bg-ink/10">
                            <div data-bar className="h-full rounded" style={{ width: `${(s.views / maxViews) * 100}%`, background: f.accent }} />
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
                <p className="mt-6 border-t border-ink/20 pt-4 text-xs leading-relaxed text-choc/60">
                  Реакции — сумма реакций, комментариев и репостов. Виральный охват указан приблизительно. Шкала — доля просмотров относительно самого просматриваемого ролика.
                </p>
              </div>
            )}

            {platformRows.length > 0 && (
              <table className="mt-16 w-full text-left text-sm">
                <caption className="mb-3 text-left text-xs text-choc/60">По площадкам</caption>
                <thead className="text-xs text-choc/60">
                  <tr><th className="pb-2 font-normal">Площадка</th><th className="pb-2 text-right font-normal">Размещений</th><th className="pb-2 text-right font-normal">Просмотров</th></tr>
                </thead>
                <tbody>
                  {platformRows.map((p) => (
                    <tr key={p.id} className="border-t border-ink/15">
                      <th className="py-3 font-medium">{p.name}</th>
                      <td className="py-3 text-right tabular-nums">{stats.byPlatform[p.id].placements !== null ? nf.format(stats.byPlatform[p.id].placements!) : '—'}</td>
                      <td className="py-3 text-right tabular-nums">{stats.byPlatform[p.id].views !== null ? nf.format(stats.byPlatform[p.id].views!) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-6">
            <h2 className="display text-[clamp(2.8rem,10vw,4.5rem)] lg:col-span-7 lg:text-[clamp(4rem,6vw,7.5rem)]">
              <span className="line-mask"><span data-res-line>Показатели аудитории</span></span>
              <span className="line-mask"><span data-res-line className="serif-accent normal-case text-choc-soft">появятся после публикации</span></span>
            </h2>
            <div className="max-w-md self-end text-[1.02rem] leading-relaxed text-choc/80 lg:col-span-5 lg:pb-3">
              <p className="line-mask"><span data-res-line>Просмотры, количество размещений и ссылки на опубликованные ролики будут добавлены по каждой площадке после выхода серии.</span></p>
              <p className="line-mask mt-6 text-sm text-choc/60"><span data-res-line>Сейчас: 4 ролика готовы · ссылок на публикации: {links}</span></p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
