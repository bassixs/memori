import type { Film } from '../data/films'

interface Props {
  film: Film
  index: number
  eager: boolean
  setPose: (el: HTMLDivElement | null) => void
  setEnter: (el: HTMLDivElement | null) => void
  setExit: (el: HTMLDivElement | null) => void
  setFace: (el: HTMLDivElement | null) => void
  setShade: (el: HTMLDivElement | null) => void
}

/**
 * Карточка фильма. Три вложенных слоя трансформаций, чтобы анимации не конфликтовали:
 *  pose  — положение в колоде (active / next / background / previous), управляет FilmDeck;
 *  enter — сборка колоды при входе в раздел (ScrollTrigger);
 *  exit  — разлёт карточек при выходе из раздела (ScrollTrigger).
 */
export function FilmCard({ film, index, eager, setPose, setEnter, setExit, setFace, setShade }: Props) {
  return (
    <div ref={setPose} className="deck-card" data-index={index} aria-hidden="true">
      <div ref={setEnter} className="absolute inset-0">
        <div ref={setExit} className="absolute inset-0">
          <div ref={setFace} className="card-face cursor-grab active:cursor-grabbing" data-face={index}>
            <img
              src={film.poster.src}
              srcSet={`${film.poster.srcSmall} 480w, ${film.poster.src} 960w`}
              sizes="(max-width: 767px) 70vw, 40vh"
              alt=""
              draggable={false}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 h-full w-full select-none object-cover"
              style={{ objectPosition: film.posterPosition }}
            />
            {/* мягкий градиент для подписей */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 text-cream md:left-5 md:top-5">
              <span className="display text-[1.6rem] leading-none md:text-[2rem]">{film.number}</span>
            </div>
            <div className="pointer-events-none absolute inset-x-4 bottom-4 text-cream md:inset-x-5 md:bottom-5">
              <p className="display text-[1.5rem] leading-[0.9] md:text-[2.1rem]">{film.short}</p>
              <p className="mt-1 text-[0.7rem] font-medium text-cream/80 md:text-xs">{film.subtitle}</p>
            </div>
            {/* затемнение для карточек на заднем плане */}
            <div ref={setShade} className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: 0 }} />
          </div>
        </div>
      </div>
    </div>
  )
}
