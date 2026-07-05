'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV = [
  { href: '/properties', label: 'Properties' },
  { href: '/properties?locality=lalpur', label: 'Localities' },
  { href: '/contact', label: 'Contact' },
  { href: '/admin', label: 'Admin' }
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy-900/5 bg-cream/85 backdrop-blur-md">
      <div className="container flex h-16 md:h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md gold-gradient grid place-items-center text-navy-900 font-display font-bold text-lg shadow-sm">F</div>
          <div className="leading-tight">
            <div className="font-display text-lg md:text-xl font-semibold text-navy-900 tracking-tight">FlatsInRanchi</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold-600 -mt-0.5">Verified Luxury Homes</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map(item => (
            <Link key={item.label} href={item.href} className="text-sm font-medium text-navy-700 hover:text-gold-600 transition-colors">{item.label}</Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a href="tel:+919999999999" className="flex items-center gap-1.5 text-sm text-navy-700 hover:text-gold-600"><Phone className="w-4 h-4" /> +91 99999 99999</a>
          <Link href="/contact"><Button className="bg-navy-900 hover:bg-navy-800 text-white rounded-md h-10 px-5">Request Callback</Button></Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-navy-900/5 bg-cream">
          <div className="container py-4 flex flex-col gap-3">
            {NAV.map(item => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="text-base text-navy-700 py-1.5">{item.label}</Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)}><Button className="w-full bg-navy-900 text-white">Request Callback</Button></Link>
          </div>
        </div>
      )}
    </header>
  )
}
