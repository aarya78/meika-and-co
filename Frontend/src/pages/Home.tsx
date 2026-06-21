import AboutSection from '@/components/layout/AboutSectionProps'
import Hero from '@/components/layout/Hero'
import founder from "@/assets/founcder.webp"
import ProductSection from '@/components/layout/ProductSection'
import TestimonialsSection from '@/components/layout/TestimonialsSection'

function Home() {
  return (
    <div>
      <Hero />
      <AboutSection founderImage={founder} />
      <ProductSection />
      <TestimonialsSection />
    </div>
  )
}

export default Home
