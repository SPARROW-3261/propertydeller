import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck, MapPin, Home as HomeIcon, Maximize } from 'lucide-react'

export default function PropertyCard({ p }) {
  const priceLabel = p.priceLakhs >= 100 ? `₹${(p.priceLakhs/100).toFixed(2)} Cr` : `₹${p.priceLakhs} L`
  return (
    <Link href={`/properties/${p.slug}`} className="group block rounded-xl overflow-hidden bg-white border border-navy-900/5 hover:border-gold-300 hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-100">
        <Image src={p.images?.[0] || ''} alt={p.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
        {p.verified && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[11px] font-medium text-navy-900 shadow-sm">
            <BadgeCheck className="w-3.5 h-3.5 text-gold-600" /> Verified
          </div>
        )}
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-navy-900/85 backdrop-blur text-[11px] font-medium text-white">
          {p.possession}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-xl text-navy-900 leading-tight group-hover:text-gold-700 transition">{p.title}</h3>
            <div className="flex items-center gap-1 text-xs text-navy-700 mt-1"><MapPin className="w-3.5 h-3.5" /> {p.locality}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-xl text-navy-900">{priceLabel}</div>
            <div className="text-[10px] text-navy-700/60 uppercase tracking-wider">Starting</div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-navy-900/5 text-xs text-navy-700">
          <span className="flex items-center gap-1"><HomeIcon className="w-3.5 h-3.5 text-gold-600" /> {p.bhk} BHK</span>
          <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5 text-gold-600" /> {p.area} sqft</span>
          <span className="ml-auto text-navy-700/60">{p.builder}</span>
        </div>
      </div>
    </Link>
  )
}
