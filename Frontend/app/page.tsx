'use client'
// FILE: app/page.tsx

import HeroSection from '@/components/sections/HeroSection'
import Ticker from '@/components/ui/Ticker'
import SearchBar from '@/components/ui/SearchBar'
import FeaturesStrip from '@/components/sections/FeaturesStrip'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import TierSection from '@/components/sections/TierSection'
import CurrencySection from '@/components/sections/CurrencySection'
import WarehouseSection from '@/components/sections/WarehouseSection'
import StatsSection from '@/components/sections/StatsSection'
import NewsletterSection from '@/components/sections/NewsletterSection'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <Ticker />
      <SearchBar />
      <FeaturesStrip />
      <FeaturedProducts />
      <TierSection />
      <CurrencySection />
      <WarehouseSection />
      <StatsSection />
      <NewsletterSection />
    </main>
  )
}
