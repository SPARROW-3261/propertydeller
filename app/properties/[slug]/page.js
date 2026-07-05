'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import PropertyCard from '@/components/property-card'
import LeadForm from '@/components/lead-form'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { BadgeCheck, MapPin, Home as HomeIcon, Maximize, Building2, Calendar, Layers, Users, Check, Phone } from 'lucide-react'

export default function PropertyDetailPage() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/properties/${slug}`).then(r => r.json()).then(d => setData(d)).catch(() => {})
  }, [slug])

  if (!data) {
    return (
      <div className="min-h-screen bg-cream">
        <SiteHeader />
        <div className="container py-20"><div className="animate-pulse h-96 rounded-xl bg-white" /></div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="min-h-screen bg-cream">
        <SiteHeader />
        <div className="container py-32 text-center">
          <h1 className="font-display text-4xl text-navy-900">Property not found</h1>
          <Link href="/properties" className="text-gold-700 mt-4 inline-block">Browse all properties →</Link>
        </div>
      </div>
    )
  }

  const p = data.property
  const priceLabel = p.priceLakhs >= 100 ? `₹${(p.priceLakhs/100).toFixed(2)} Cr` : `₹${p.priceLakhs} L`
  const emi = Math.round((p.priceLakhs * 100000 * 0.0075 * Math.pow(1.0075, 240)) / (Math.pow(1.0075, 240) - 1))

  const faqs = [
    { q: 'Is this property RERA registered?', a: `Yes, ${p.title} is RERA-registered under ${p.rera}. All approvals are in place.` },
    { q: 'What is the possession status?', a: `Current possession status is: ${p.possession}.` },
    { q: 'Can I get a home loan?', a: 'Yes, all leading banks (SBI, HDFC, ICICI, Axis) have pre-approved this project for home loans up to 80% of the property value.' },
    { q: 'Are site visits free?', a: 'Yes, FlatsInRanchi arranges complimentary site visits with our property experts. Just request one through the form on this page.' }
  ]

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />

      {/* GALLERY */}
      <section className="container pt-6">
        <div className="text-xs text-navy-700/70 mb-3"><Link href="/" className="hover:text-gold-700">Home</Link> / <Link href="/properties" className="hover:text-gold-700">Properties</Link> / <span className="text-navy-900">{p.title}</span></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative aspect-[16/10] rounded-xl overflow-hidden">
            {typeof p.images[activeImg] === 'string' && p.images[activeImg].startsWith('data:') ? (
              <img src={p.images[activeImg]} alt={p.title} className="w-full h-full object-cover" />
            ) : (
              <Image src={p.images[activeImg]} alt={p.title} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 66vw" />
            )}
            {p.verified && <div className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-xs font-medium"><BadgeCheck className="w-4 h-4 text-gold-600" /> RERA Verified — {p.rera}</div>}
          </div>
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3">
            {p.images.slice(0, 4).map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`relative aspect-[4/3] rounded-lg overflow-hidden ring-2 ${activeImg === i ? 'ring-gold' : 'ring-transparent'} transition`}>
                <Image src={img} alt="" fill className="object-cover" sizes="30vw" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT: DETAILS */}
        <div className="lg:col-span-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gold-600">{p.builder}</div>
              <h1 className="font-display text-3xl md:text-5xl text-navy-900 mt-1.5">{p.title}</h1>
              <div className="flex items-center gap-1 text-sm text-navy-700 mt-2"><MapPin className="w-4 h-4" /> {p.locality}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-4xl text-navy-900">{priceLabel}</div>
              <div className="text-xs text-navy-700/60">Starting price • ₹{p.pricePerSqft}/sqft</div>
              <div className="text-xs text-gold-700 mt-1">EMI ₹{emi.toLocaleString('en-IN')}/mo (20 yrs @ 9%)</div>
            </div>
          </div>

          {/* KEY STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {[
              { icon: HomeIcon, label: 'Configuration', value: `${p.bhk} BHK` },
              { icon: Maximize, label: 'Carpet Area', value: `${p.area} sqft` },
              { icon: Calendar, label: 'Possession', value: p.possession },
              { icon: Layers, label: 'Floors', value: `${p.floors} floors` }
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-navy-900/5">
                <s.icon className="w-4 h-4 text-gold-600 mb-2" />
                <div className="text-[11px] uppercase tracking-wider text-navy-700/60">{s.label}</div>
                <div className="font-semibold text-navy-900 mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>

          <p className="font-display text-xl text-navy-700 italic mt-10 text-balance">{p.tagline}</p>
          <p className="text-navy-800 leading-relaxed mt-5">{p.description}</p>

          {/* TABS */}
          <Tabs defaultValue="amenities" className="mt-10">
            <TabsList className="bg-cream-100 p-1 h-auto">
              <TabsTrigger value="amenities" className="data-[state=active]:bg-navy-900 data-[state=active]:text-white px-5 py-2">Amenities</TabsTrigger>
              <TabsTrigger value="location" className="data-[state=active]:bg-navy-900 data-[state=active]:text-white px-5 py-2">Location</TabsTrigger>
            </TabsList>
            <TabsContent value="amenities" className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {p.amenities.map(a => (
                  <div key={a} className="flex items-center gap-2 text-sm text-navy-800"><Check className="w-4 h-4 text-gold-600" /> {a}</div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="location" className="pt-6">
              <div className="rounded-xl overflow-hidden aspect-[16/9] bg-cream-100 relative border border-navy-900/5">
                <iframe title="map" className="w-full h-full" src={`https://www.google.com/maps?q=${p.lat},${p.lng}&z=14&output=embed`} loading="lazy" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
                {[{ k: 'Birsa Munda Airport', v: '12 km' }, { k: 'Ranchi Junction', v: '6 km' }, { k: 'Main Road Mall', v: '3 km' }, { k: 'DPS School', v: '2 km' }, { k: 'RIMS Hospital', v: '4 km' }, { k: 'Big Bazaar', v: '1 km' }].map((x, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white border border-navy-900/5"><span className="text-navy-700">{x.k}</span><span className="text-gold-700 font-medium">{x.v}</span></div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* FAQs */}
          <div className="mt-12">
            <h3 className="font-display text-2xl text-navy-900 mb-4">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="rounded-xl bg-white border border-navy-900/5 px-5">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`f${i}`} className="border-b last:border-0 border-navy-900/5">
                  <AccordionTrigger className="text-left text-navy-900 hover:text-gold-700">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-navy-700">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* RIGHT: LEAD FORM */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24">
            <LeadForm propertySlug={p.slug} propertyTitle={p.title} source="property_detail" title="Get Best Price" subtitle={`Connect with our ${p.title} expert.`} ctaLabel="Get Best Price" />
            <div className="mt-4 p-4 rounded-xl bg-navy-900 text-white">
              <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-gold-300" /> Or call us directly</div>
              <div className="font-display text-2xl mt-1">+91 99999 99999</div>
              <div className="text-xs text-white/60 mt-0.5">Mon–Sun, 9am–9pm</div>
            </div>
          </div>
        </aside>
      </section>

      {/* RELATED */}
      {data.related && data.related.length > 0 && (
        <section className="container pb-20">
          <h2 className="font-display text-3xl text-navy-900 mb-6">Similar Properties in {p.locality.split(',')[0]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{data.related.map(r => <PropertyCard key={r.id} p={r} />)}</div>
        </section>
      )}

      <SiteFooter />
    </div>
  )
}
