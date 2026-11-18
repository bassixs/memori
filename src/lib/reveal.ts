import { gsap, SplitText } from './gsap'

/**
 * Построчное появление заголовка через маску (SplitText, mask: 'lines').
 * После появления разбиение снимается (split.revert), чтобы при смене ширины
 * окна текст снова переносился естественно. Вызывается внутри useGSAP / matchMedia.
 */
export function revealLines(el: Element | null, opts: { trigger?: Element | null; start?: string; delay?: number } = {}) {
  if (!el) return
  const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' })
  return gsap.from(split.lines, {
    yPercent: 108,
    rotation: 2.5,
    transformOrigin: '0% 100%',
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.08,
    delay: opts.delay ?? 0,
    scrollTrigger: { trigger: opts.trigger ?? el, start: opts.start ?? 'top 82%', once: true },
    onComplete: () => split.revert(),
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
