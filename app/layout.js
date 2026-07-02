import './globals.css'
import { Playfair_Display, Inter } from 'next/font/google'

import { Toaster } from 'sonner'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata = {
  title: 'FlatsInRanchi — Verified Luxury Flats & Apartments in Ranchi',
  description: 'Discover premium verified 2BHK, 3BHK & 4BHK flats in Lalpur, Kanke Road, Harmu, Ashok Nagar and across Ranchi. Trusted builders. Best prices. Expert guidance.',
  keywords: 'flats in ranchi, apartments ranchi, 3bhk ranchi, 2bhk ranchi, lalpur flats, kanke road apartments, verified properties ranchi',
  openGraph: {
    title: 'FlatsInRanchi — Verified Premium Flats in Ranchi',
    description: 'India\'s most trusted platform for verified flats in Ranchi. Browse, compare and book site visits.',
    type: 'website'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="font-sans antialiased bg-cream text-navy-900">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
