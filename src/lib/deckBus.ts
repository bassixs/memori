/** Связь колоды роликов с остальными разделами (финал, навигация). */
type DeckApi = { goTo: (index: number) => void }
let api: DeckApi | null = null

export const deckBus = {
  register(a: DeckApi | null) {
    api = a
  },
  /** Прокрутить к галерее и сделать карточку активной */
  show(index?: number) {
    const el = document.getElementById('films')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    if (index !== undefined) window.setTimeout(() => api?.goTo(index), reduce ? 0 : 500)
  },
}

export const scrollToId = (id: string) => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
