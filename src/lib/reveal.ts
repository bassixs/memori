import { gsap } from './gsap'

/**
 * Построчное появление заголовка через маску. Строки заданы в разметке
 * (.line-mask > [data-line]), поэтому раскладка текста одинакова до, во время
 * и после анимации — без перескоков. Вызывается внутри useGSAP / matchMedia.
 */
export function revealLines(el: Element | null, opts: { trigger?: Element | null; start?: string; delay?: number } = {}) {
  if (!el) return
  const lines = el.querySelectorAll('[data-line]')
  if (!lines.length) return
  return gsap.from(lines, {
    yPercent: 108,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.09,
    delay: opts.delay ?? 0,
    scrollTrigger: { trigger: opts.trigger ?? el, start: opts.start ?? 'top 82%', once: true },
  })
}

/** Появление блока через «шторку» clip-path — для изображений */
export function revealImage(el: Element | null, opts: { trigger?: Element | null; from?: 'bottom' | 'left' | 'right'; delay?: number } = {}) {
  if (!el) return
  const from = opts.from ?? 'bottom'
  const clip = from === 'bottom' ? 'inset(100% 0% 0% 0% round 18px)' : from === 'left' ? 'inset(0% 100% 0% 0% round 18px)' : 'inset(0% 0% 0% 100% round 18px)'
  return gsap.fromTo(
    el,
    { clipPath: clip },
    { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.3, ease: 'expo.inOut', delay: opts.delay ?? 0, scrollTrigger: { trigger: opts.trigger ?? el, start: 'top 85%', once: true } },
  )
}
