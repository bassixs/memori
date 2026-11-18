import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Film } from '../data/films'

interface Props {
  films: Film[]
  active: number
  onPrev: () => void
  onNext: () => void
  onSelect: (i: number) => void
}

/** Управление колодой: стрелки, индикатор с именами героев и прогресс. */
export function DeckController({ films, active, onPrev, onNext, onSelect }: Props) {
  return (
    <div className="flex w-full items-center gap-3 md:gap-5">
      <button type="button" onClick={onPrev} aria-label="Предыдущий фильм" className="group grid size-12 shrink-0 place-items-center rounded-full border border-cream/30 text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink md:size-14">
        <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.75} />
      </button>
      <button type="button" onClick={onNext} aria-label="Следующий фильм" className="group grid size-12 shrink-0 place-items-center rounded-full bg-cream text-ink transition-colors hover:bg-gold-soft md:size-14">
        <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
      </button>

      <ol className="ml-1 flex min-w-0 flex-1 gap-1.5 md:ml-4 md:gap-2" aria-label="Фильмы">
        {films.map((f, i) => (
          <li key={f.id} className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={i === active ? 'true' : undefined}
              aria-label={`Фильм ${f.number}: ${f.title}`}
              className="group block w-full py-2 text-left"
            >
              <span className="relative block h-[2px] overflow-hidden rounded bg-cream/20">
                <span className="absolute inset-0 origin-left bg-cream transition-transform duration-700 ease-out-expo" style={{ transform: `scaleX(${i === active ? 1 : 0})` }} />
              </span>
              <span className={`mt-2 hidden truncate text-xs transition-colors md:block ${i === active ? 'text-cream' : 'text-cream/45 group-hover:text-cream/80'}`}>
                <span className="tabular-nums">{f.number}</span> {f.short}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
