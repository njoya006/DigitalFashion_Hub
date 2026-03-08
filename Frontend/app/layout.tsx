import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DigitalFashion Hub | Premium Global Marketplace',
  description:
    'DigitalFashion Hub — A premium dark-luxury e-commerce marketplace for designer fashion, accessories, and curated style from verified sellers worldwide.',
  keywords: ['fashion', 'luxury', 'e-commerce', 'designer', 'marketplace'],
  openGraph: {
    title: 'DigitalFashion Hub | Premium Global Marketplace',
    description: 'Premium designer fashion marketplace with multi-currency support.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body
        style={{
          backgroundColor: '#000000',
          color: '#f5f0e8',
          fontFamily: 'var(--font-dm)',
        }}
      >
        <CustomCursor />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
