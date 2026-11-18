import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, Draggable, SplitText, CustomEase, useGSAP)

/** Мягкий «киношный» разгон и долгое торможение — основная кривая колоды. */
CustomEase.create('deck', 'M0,0 C0.32,0 0.18,1 1,1')
/** Плотный вход с инерцией. */
CustomEase.create('settle', 'M0,0 C0.12,0.6 0.24,1 1,1')

// Только для отладки в dev-режиме
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger })

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isNarrow = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export { gsap, ScrollTrigger, Draggable, SplitText, useGSAP }
