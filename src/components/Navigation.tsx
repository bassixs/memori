import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ScrollTrigger } from '../lib/gsap'
import { scrollToId } from '../lib/deckBus'

const links = [
  { id: 'project', label: 'Проект' },
  { id: 'films', label: 'Фильмы' },
  { id: 'production', label: 'Реализация' },
  { id: 'distribution', label: 'Аудитория' },
  { id: 'final', label: 'Финал' },
]

export function Navigation() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('Вступление')
  const [index, setIndex] = useState(0)

  // Подпись текущего раздела внизу слева
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')]
    const triggers = sections.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) {
            setCurrent(el.dataset.section ?? '')
            setIndex(i)
          }
        },
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    scrollToId(id)
  }

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex items-start justify-between p-3 md:p-5">
        <button type="button" onClick={() => go('top')} className="pointer-events-auto flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-cream shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]">
          <span className="display text-[1.35rem] leading-none">Летопись</span>
          <span className="text-[10px] text-cream/60">2026</span>
        </button>
        {/* Индикатор текущего раздела */}
        <span className={`pointer-events-none ml-2 mr-auto mt-2 hidden items-center gap-2 rounded-full bg-ink/90 px-3 py-1.5 text-[11px] text-cream transition-opacity duration-500 lg:flex ${index === 0 ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true">
          <span className="tabular-nums text-cream/50">{String(index).padStart(2, '0')}</span>
          <span>{current}</span>
        </span>

        <nav aria-label="Разделы" className="pointer-events-auto hidden h-11 items-center gap-1 rounded-full bg-ink px-2 text-sm text-cream shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] md:flex">
          {links.map((l) => (
            <button key={l.id} type="button" onClick={() => go(l.id)} className="rounded-full px-3 py-1.5 text-cream/75 transition-colors hover:bg-cream hover:text-ink">
              {l.label}
            </button>
          ))}
        </nav>

        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} className="pointer-events-auto grid size-11 place-items-center rounded-full bg-ink text-cream md:hidden">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {open && (
        <div id="mobile-menu" className="fixed inset-0 z-[99] flex flex-col justify-end bg-ink px-4 pb-10 pt-24 text-cream md:hidden">
          <nav aria-label="Разделы">
            {links.map((l, i) => (
              <button key={l.id} type="button" onClick={() => go(l.id)} className="flex w-full items-baseline gap-4 border-b border-cream/15 py-3 text-left">
                <span className="text-xs tabular-nums text-cream/50">0{i + 1}</span>
                <span className="display text-[3.2rem]">{l.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

    </>
  )
}
