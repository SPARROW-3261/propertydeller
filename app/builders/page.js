'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { ArrowRight } from 'lucide-react'

export default function BuildersPage() {
  const [builders, setBuilders] = useState([])
  useEffect(() => {
    fetch('/api/builders').then(r => r.json()).then(d => setBuilders(d.builders || []))
  }, [])
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <div className="bg-navy-900 text-white py-14">
        <div className="container">
          <div className="text-xs uppercase tracking-[0.25em] text-gold-300 mb-2">Our Trusted Partners</div>
          <h1 className="font-display text-4xl md:text-5xl">Top Builders in Ranchi</h1>
          <p className="text-white/70 mt-2">Established developers with proven track records.</p>
        </div>
      </div>
      <div className="container py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {builders.map(b => (
          <div key={b.slug} className="p-7 rounded-xl bg-white border border-navy-900/5 hover:shadow-xl transition">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-lg gold-gradient grid place-items-center font-display font-bold text-3xl text-navy-900 flex-shrink-0">{b.name[0]}</div>
              <div className="flex-1">
                <div className="font-display text-2xl text-navy-900">{b.name}</div>
                <div className="text-sm text-gold-700">{b.tagline}</div>
                <p className="text-sm text-navy-700/80 mt-3 leading-relaxed">{b.description}</p>
                <div className="flex items-center gap-6 mt-5 pt-5 border-t border-navy-900/5">
                  <div><div className="font-display text-2xl text-navy-900">{b.activeProjects}</div><div className="text-[10px] uppercase tracking-wider text-navy-700/60">Active</div></div>
                  <div><div className="font-display text-2xl text-navy-900">{b.projects}+</div><div className="text-[10px] uppercase tracking-wider text-navy-700/60">Total</div></div>
                  <Link href={`/properties?builder=${b.slug}`} className="ml-auto text-sm text-navy-900 hover:text-gold-700 inline-flex items-center gap-1">View properties <ArrowRight className="w-3.5 h-3.5" /></Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <SiteFooter />
    </div>
  )
}
