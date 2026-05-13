import type { Metadata } from 'next'
import AnnouncementBar        from '@/components/site/AnnouncementBar'
import Navbar                 from '@/components/site/Navbar'
import Hero                   from '@/components/site/Hero'
import StatsBar               from '@/components/site/StatsBar'
import WhyKlassical           from '@/components/site/WhyKlassical'
import Services               from '@/components/site/Services'
import Pricing                from '@/components/site/Pricing'
import SellerDashboardSection from '@/components/site/SellerDashboardSection'
import DigitalHub             from '@/components/site/DigitalHub'
import ComingSoon             from '@/components/site/ComingSoon'
import Partners               from '@/components/site/Partners'
import AppDownload            from '@/components/site/AppDownload'
import Contact                from '@/components/site/Contact'
import Footer                 from '@/components/site/Footer'
import WhatsAppFloat          from '@/components/site/WhatsAppFloat'

export const metadata: Metadata = {
  title: 'Klassical Logistics & Fulfillment UK | Smart Storage. Seamless Delivery.',
  description: 'Premium UK 3PL fulfillment for Shopify, Amazon & TikTok Shop sellers. Same-day dispatch, real-time inventory, custom unboxing — based in Luton, UK.',
  keywords: ['3PL UK', 'fulfillment UK', 'Shopify fulfillment', 'Amazon FBM', 'TikTok Shop fulfillment', 'Luton warehouse', 'pick and pack UK'],
  alternates: { canonical: 'https://klassicalholdings.co.uk/' },
  openGraph: {
    type: 'website',
    url: 'https://klassicalholdings.co.uk/',
    title: 'Klassical Logistics & Fulfillment UK',
    description: 'Smart Storage. Seamless Delivery. Premium UK 3PL for Shopify, Amazon & TikTok Shop sellers.',
  },
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', overflowX: 'hidden' }}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <WhyKlassical />
        <Services />
        <DigitalHub />
        <SellerDashboardSection />
        <Pricing />
        <Partners />
        <ComingSoon />
        <AppDownload />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
