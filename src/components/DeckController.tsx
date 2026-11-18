import { ArrowLeft, ArrowRight } from 'lucide-react'

interface Props {
  onPrev: () => void
  onNext: () => void
}

/** Управление колодой: компактные стрелки справа под карточками. */
export function DeckController({ onPrev, onNext }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Предыдущий ролик"
        className="group grid size-11 place-items-center rounded-full border border-cream/35 text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Следующий ролик"
        className="group grid size-11 place-items-center rounded-full bg-cream text-ink transition-colors hover:bg-gold-soft"
      >
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}
