import { useRef } from 'react'
import { stats, totalLabels } from '../data/stats'
import { films } from '../data/films'
import { platforms } from '../data/distribution'
import { gsap, useGSAP } from '../lib/gsap'

const nf = new Intl.NumberFormat('ru-RU')

/**
 * Результаты. Показываются только реально заполненные показатели из stats.ts.
 * Пока данных нет — нейтральное состояние без цифр и пустых диаграмм.
 */
export function ResultsSection() {
  const root = useRef<HTMLElement>(null)

  const metrics = [
    ...Object.entries(stats.totals)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => ({ label: totalLabels[k as keyof typeof totalLabels], value: v as number, suffix: '' })),
    ...stats.extra.map((e) => ({ label: e.label, value: e.value, suffix: e.suffix ?? '' })),
  ]
  const filmViews = films.filter((f) => stats.byFilm[f.id].views !== null)
  const platformRows = platforms.filter((p) => stats.byPlatform[p.id].views !== null || stats.byPlatform[p.id].placements !== null)
  const links = films.reduce((n, f) => n + Object.values(f.publications).filter(Boolean).length, 0)
  const hasData = metrics.length > 0 || filmViews.length > 0 || platformRows.length > 0

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Счётчики анимируются только при наличии данных; итоговое число уже в разметке
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count)
          const o = { v: 0 }
          gsap.to(o, {
            v: target,
            duration: 1.8,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            onUpdate: () => {
              el.textContent = nf.format(Math.round(o.v))
            },
          })
        })
        gsap.from('[data-res-line]', { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } })
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
            {metrics.length > 0 && (
              <dl className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((m, i) => (
                  <div key={m.label} className={i === 0 ? 'sm:col-span-2' : ''}>
                    <dd className={`display leading-none ${i === 0 ? 'text-[clamp(6rem,16vw,14rem)]' : 'text-[clamp(4rem,8vw,7rem)]'}`}>
                      <span data-count={m.value}>{nf.format(m.value)}</span>
                      {m.suffix}
                    </dd>
                    <dt className="mt-2 text-sm text-choc/70">{m.label}</dt>
                  </div>
                ))}
              </dl>
            )}
            {(filmViews.length > 0 || platformRows.length > 0) && (
              <div className="mt-16 grid gap-10 md:grid-cols-2">
                {filmViews.length > 0 && (
                  <table className="w-full text-left text-sm">
                    <caption className="mb-3 text-left text-xs text-choc/60">Просмотры по роликам</caption>
                    <tbody>
                      {filmViews.map((f) => (
                        <tr key={f.id} className="border-t border-ink/15">
                          <th className="py-3 font-medium">{f.number} · {f.title}</th>
                          <td className="py-3 text-right tabular-nums">{nf.format(stats.byFilm[f.id].views!)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {platformRows.length > 0 && (
                  <table className="w-full text-left text-sm">
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
              </div>
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
