'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import PropertyCard from '@/components/property-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { LOCALITIES, BUILDERS } from '@/lib/seed-data'

function PropertiesInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('recommended')
  const [q, setQ] = useState(sp.get('q') || '')

  const filters = {
    locality: sp.get('locality') || '',
    bhk: sp.get('bhk') || '',
    builder: sp.get('builder') || '',
    possession: sp.get('possession') || '',
    minBudget: sp.get('minBudget') || '',
    maxBudget: sp.get('maxBudget') || ''
  }

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams(sp.toString())
    params.set('sort', sort)
    fetch(`/api/properties?${params.toString()}`).then(r => r.json()).then(d => { setItems(d.properties || []); setLoading(false) }).catch(() => setLoading(false))
  }, [sp, sort])

  const update = (key, value) => {
    const params = new URLSearchParams(sp.toString())
    if (value && value !== 'any') params.set(key, value); else params.delete(key)
    router.push(`/properties?${params.toString()}`)
  }

  const clearAll = () => router.push('/properties')

  const submitSearch = (e) => { e.preventDefault(); update('q', q) }

  const activeCount = Object.values(filters).filter(Boolean).length + (q ? 1 : 0)

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <div className="bg-navy-900 text-white py-10 md:py-14">
        <div className="container">
          <div className="text-xs uppercase tracking-[0.25em] text-gold-300 mb-2">All Properties</div>
          <h1 className="font-display text-3xl md:text-5xl">Verified Flats in Ranchi</h1>
          <p className="text-white/70 mt-2">Browse {items.length || '120+'} hand-picked premium homes</p>
          <form onSubmit={submitSearch} className="mt-6 max-w-2xl flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-700" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, locality, builder..." className="pl-10 h-12 bg-white text-navy-900 border-0" />
            </div>
            <Button type="submit" className="h-12 px-6 bg-gold hover:bg-gold-600 text-navy-900 font-semibold">Search</Button>
          </form>
        </div>
      </div>

      <div className="container py-10">
        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-2 text-sm text-navy-900"><SlidersHorizontal className="w-4 h-4" /> Filters:</div>
          <Select value={filters.locality || 'any'} onValueChange={v => update('locality', v)}>
            <SelectTrigger className="w-[160px] h-10 bg-white"><SelectValue placeholder="Locality" /></SelectTrigger>
            <SelectContent><SelectItem value="any">All localities</SelectItem>{LOCALITIES.map(l => <SelectItem key={l.slug} value={l.slug}>{l.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.bhk || 'any'} onValueChange={v => update('bhk', v)}>
            <SelectTrigger className="w-[110px] h-10 bg-white"><SelectValue placeholder="BHK" /></SelectTrigger>
            <SelectContent><SelectItem value="any">Any BHK</SelectItem><SelectItem value="2">2 BHK</SelectItem><SelectItem value="3">3 BHK</SelectItem><SelectItem value="4">4 BHK</SelectItem></SelectContent>
          </Select>
          <Select value={filters.builder || 'any'} onValueChange={v => update('builder', v)}>
            <SelectTrigger className="w-[170px] h-10 bg-white"><SelectValue placeholder="Builder" /></SelectTrigger>
            <SelectContent><SelectItem value="any">All builders</SelectItem>{BUILDERS.map(b => <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.possession || 'any'} onValueChange={v => update('possession', v)}>
            <SelectTrigger className="w-[160px] h-10 bg-white"><SelectValue placeholder="Possession" /></SelectTrigger>
            <SelectContent><SelectItem value="any">Any possession</SelectItem><SelectItem value="Ready to Move">Ready to Move</SelectItem><SelectItem value="Dec 2025">Dec 2025</SelectItem><SelectItem value="Mar 2026">Mar 2026</SelectItem><SelectItem value="Jun 2026">Jun 2026</SelectItem><SelectItem value="Sep 2026">Sep 2026</SelectItem></SelectContent>
          </Select>
          {activeCount > 0 && <button onClick={clearAll} className="text-xs text-navy-700 hover:text-gold-700 inline-flex items-center gap-1"><X className="w-3 h-3" /> Clear all</button>}
          <div className="ml-auto">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px] h-10 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                <SelectItem value="priceDesc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] rounded-xl bg-white border border-navy-900/5 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-display text-2xl text-navy-900">No properties match your filters</div>
            <p className="text-navy-700/70 mt-2">Try adjusting your search criteria or <button onClick={clearAll} className="underline">clear all filters</button>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {items.map(p => <PropertyCard key={p.id || p.slug} p={p} />)}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}

export default function PropertiesPage() {
  return <Suspense fallback={<div className="min-h-screen bg-cream" />}><PropertiesInner /></Suspense>
}
