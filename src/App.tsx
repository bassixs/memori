import { useEffect } from 'react'
import { Navigation } from './components/Navigation'
import { HeroSection } from './components/HeroSection'
import { ProjectContext } from './components/ProjectContext'
import { FilmDeck } from './components/FilmDeck'
import { ProductionGallery } from './components/ProductionGallery'
import { DistributionSection } from './components/DistributionSection'
import { ResultsSection } from './components/ResultsSection'
import { FinalSection } from './components/FinalSection'
import { ScrollTrigger } from './lib/gsap'

export default function App() {
  // Пересчитать триггеры, когда догрузятся шрифты и изображения
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <ProjectContext />
        <FilmDeck />
        <ProductionGallery />
        <DistributionSection />
        <ResultsSection />
        <FinalSection />
      </main>
    </>
  )
}
