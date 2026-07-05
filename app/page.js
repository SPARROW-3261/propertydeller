'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import PropertyCard from '@/components/property-card'
import LeadForm from '@/components/lead-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, BadgeCheck, ShieldCheck, Users, TrendingUp, Star, ArrowRight, Award, Phone } from 'lucide-react'
import { HERO_IMAGE, HERO_SECONDARY, CTA_IMAGE, LOCALITIES, TESTIMONIALS } from '@/lib/seed-data'

const App = () => {
  const router = useRouter()
  const [properties, setProperties] = useState([])
  const [search, setSearch] = useState({ locality: '', bhk: '', budget: '' })

  useEffect(() => {
    fetch('/api/properties').then(r => r.json()).then(d => setProperties(d.properties || [])).catch(() => {})
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search.locality) params.set('locality', search.locality)
    if (search.bhk) params.set('bhk', search.bhk)
    if (search.budget) {
      const [min, max] = search.budget.split('-')
      if (min) params.set('minBudget', min)
      if (max) params.set('maxBudget', max)
    }
    router.push(`/properties?${params.toString()}`)
  }

  const featured = properties.slice(0, 6)

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={HERO_IMAGE} alt="Luxury apartment" fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 luxury-gradient" />
        </div>
        <div className="relative container py-24 md:py-36">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs uppercase tracking-[0.2em]">
              <BadgeCheck className="w-3.5 h-3.5 text-gold-300" /> Ranchi&apos;s most trusted property platform
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mt-5 leading-[1.05] text-balance">
              Find your perfect flat <span className="text-gold-300 italic">in Ranchi</span>
            </h1>
            <p className="text-white/85 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
              Hand-picked, RERA-verified luxury homes across Ranchi. From Lalpur to Kanke Road — your dream address awaits.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative mt-10 max-w-5xl rounded-2xl bg-white/95 backdrop-blur p-2.5 shadow-2xl animate-fade-up">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              <div className="md:col-span-4 flex items-center gap-2 px-3 border-r border-navy-900/10">
                <MapPin className="w-4 h-4 text-gold-600" />
                <Select value={search.locality} onValueChange={v => setSearch({ ...search, locality: v })}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0 h-12 text-sm"><SelectValue placeholder="Choose locality" /></SelectTrigger>
                  <SelectContent>
                    {LOCALITIES.map(l => <SelectItem key={l.slug} value={l.slug}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3 border-r border-navy-900/10">
                <Select value={search.bhk} onValueChange={v => setSearch({ ...search, bhk: v })}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0 h-12 text-sm"><SelectValue placeholder="BHK type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 BHK</SelectItem>
                    <SelectItem value="3">3 BHK</SelectItem>
                    <SelectItem value="4">4 BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Select value={search.budget} onValueChange={v => setSearch({ ...search, budget: v })}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0 h-12 text-sm"><SelectValue placeholder="Budget" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="40-60">₹40L - 60L</SelectItem>
                    <SelectItem value="60-80">₹60L - 80L</SelectItem>
                    <SelectItem value="80-120">₹80L - 1.2 Cr</SelectItem>
                    <SelectItem value="120-300">₹1.2 Cr +</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Button onClick={handleSearch} className="w-full h-12 bg-navy-900 hover:bg-navy-800 text-white rounded-lg">
                  <Search className="w-4 h-4 mr-1.5" /> Search
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-8 text-white/80 text-sm">
            <div><div className="font-display text-2xl text-white">120+</div>Verified flats</div>
            <div><div className="font-display text-2xl text-white">4,800+</div>Happy families</div>
          </div>
        </div>
      </section>

      {/* LOCALITIES */}
      <section className="container py-20 md:py-28">
        <div className="max-w-2xl mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-gold-600 mb-2">Discover Ranchi</div>
          <h2 className="font-display text-3xl md:text-5xl text-navy-900">Popular Localities</h2>
          <p className="text-navy-700/80 mt-2">Each locality offers a distinct flavour of Ranchi living. Pick yours.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {LOCALITIES.map(l => (
            <Link key={l.slug} href={`/properties?locality=${l.slug}`} className="group relative aspect-[5/4] rounded-xl overflow-hidden">
              <Image src={l.image} alt={l.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/95 via-navy-900/40 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="font-display text-2xl">{l.name}</div>
                <div className="text-xs text-white/70 mt-0.5">{l.tagline}</div>
                <div className="text-xs text-gold-300 mt-2 inline-flex items-center gap-1">{l.count} properties <ArrowRight className="w-3 h-3" /></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-navy-900 text-cream py-20 md:py-28">
        <div className="container">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.25em] text-gold-300 mb-2">The FlatsInRanchi promise</div>
            <h2 className="font-display text-3xl md:text-5xl text-white">Why families trust us with their biggest decision</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {[
              { icon: ShieldCheck, title: '100% Verified', text: 'Every listing is RERA-checked & physically inspected by our team.' },
              { icon: Users, title: 'Expert Guidance', text: 'Dedicated relationship managers walk you through every step.' },
              { icon: TrendingUp, title: 'Best Price', text: 'Direct from verified sellers with no broker margins — you save lakhs.' },
              { icon: Award, title: 'Premium Only', text: 'We curate only the top 5% of homes that meet our standards.' }
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-white/10 hover:border-gold/40 hover:bg-white/5 transition">
                <div className="w-11 h-11 rounded-lg gold-gradient grid place-items-center text-navy-900 mb-4"><f.icon className="w-5 h-5" /></div>
                <div className="font-display text-xl text-white mb-1.5">{f.title}</div>
                <p className="text-sm text-cream/70 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="container py-20 md:py-28">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-gold-600 mb-2">Curated for you</div>
            <h2 className="font-display text-3xl md:text-5xl text-navy-900">Featured Properties</h2>
            <p className="text-navy-700/80 mt-2 max-w-xl">Hand-picked premium residences from Ranchi&apos;s most reputable developers.</p>
          </div>
          <Link href="/properties"><Button variant="ghost" className="text-navy-900 hover:text-gold-700">View all <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>
        {featured.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] rounded-xl bg-white border border-navy-900/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(p => <PropertyCard key={p.id || p.slug} p={p} />)}
          </div>
        )}
      </section>


      {/* TESTIMONIALS */}
      <section className="container py-20 md:py-28">
        <div className="max-w-2xl mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-gold-600 mb-2">From our buyers</div>
          <h2 className="font-display text-3xl md:text-5xl text-navy-900">Stories from happy families</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="p-7 rounded-xl bg-white border border-navy-900/5">
              <div className="flex gap-0.5 text-gold-500 mb-4">{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}</div>
              <p className="text-navy-800 leading-relaxed font-display text-lg italic">“{t.text}”</p>
              <div className="mt-5 pt-5 border-t border-navy-900/5">
                <div className="font-semibold text-navy-900">{t.name}</div>
                <div className="text-xs text-navy-700/60">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA WITH LEAD FORM */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0"><Image src={CTA_IMAGE} alt="" fill className="object-cover" /><div className="absolute inset-0 bg-navy-900/85" /></div>
        <div className="relative container py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <div className="text-xs uppercase tracking-[0.25em] text-gold-300 mb-3">Speak to an expert</div>
            <h2 className="font-display text-3xl md:text-5xl text-balance">Let our experts find your perfect flat in 24 hours.</h2>
            <p className="text-white/80 mt-5 leading-relaxed max-w-lg">Tell us what you&apos;re looking for. We&apos;ll hand-pick the best 3 options, arrange site visits, and negotiate the best price on your behalf.</p>
            <div className="mt-8 space-y-3 text-sm text-white/85">
              <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-gold-300" /> Personalised shortlist within 24 hours</div>
              <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-gold-300" /> Free site visit with dedicated expert</div>
              <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-gold-300" /> Best-price negotiation guarantee</div>
            </div>
          </div>
          <div>
            <LeadForm source="homepage_cta" title="Talk to a property expert" subtitle="Share your requirements — we&apos;ll do the rest." ctaLabel="Get My Shortlist" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

export default App
