import Hero from '@/components/layout/Hero'
import ProductSection from '@/components/layout/ProductSection'
import TestimonialsSection from '@/components/layout/TestimonialsSection'
import SEO from '@/components/SEO'
import { heroSlides } from '@/data/heroSlides'

function Home() {
  return (
    <>
      <SEO
        title="Meika & Co | Handmade Fabric Dolls, Crochet Dolls & Personalized Gifts"
        description="Discover beautifully handcrafted fabric and crochet dolls made with love at Meika & Co. Shop unique handmade dolls, personalized gifts, soft toys, and custom creations delivered across India."
        pathname="/"
      >
        <link rel="preload" as="image" href={heroSlides[0].image as unknown as string} />
      </SEO>

      <Hero />
      <ProductSection />
      <TestimonialsSection />
    </>
  )
}

export default Home
