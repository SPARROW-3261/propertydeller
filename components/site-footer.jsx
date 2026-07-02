import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-cream/90 mt-24">
      <div className="container py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-md gold-gradient grid place-items-center text-navy-900 font-display font-bold text-lg">F</div>
            <div className="font-display text-xl text-white">FlatsInRanchi</div>
          </div>
          <p className="text-sm text-cream/70 leading-relaxed max-w-xs">India's most trusted destination for verified luxury flats in Ranchi. Every listing is RERA-checked, every visit personally guided.</p>
          <div className="flex gap-3 mt-5">
            <a href="#" className="w-9 h-9 rounded-md border border-cream/15 grid place-items-center hover:bg-gold hover:text-navy-900 transition"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-md border border-cream/15 grid place-items-center hover:bg-gold hover:text-navy-900 transition"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-md border border-cream/15 grid place-items-center hover:bg-gold hover:text-navy-900 transition"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold-300 mb-4">Explore</div>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-gold-300" href="/properties">All Properties</Link></li>
            <li><Link className="hover:text-gold-300" href="/builders">Builders</Link></li>
            <li><Link className="hover:text-gold-300" href="/properties?bhk=3">3 BHK Flats</Link></li>
            <li><Link className="hover:text-gold-300" href="/properties?bhk=2">2 BHK Flats</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold-300 mb-4">Top Localities</div>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-gold-300" href="/properties?locality=lalpur">Lalpur</Link></li>
            <li><Link className="hover:text-gold-300" href="/properties?locality=kanke-road">Kanke Road</Link></li>
            <li><Link className="hover:text-gold-300" href="/properties?locality=harmu">Harmu</Link></li>
            <li><Link className="hover:text-gold-300" href="/properties?locality=ashok-nagar">Ashok Nagar</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold-300 mb-4">Contact</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-gold-300" /> Lalpur Chowk, Ranchi, Jharkhand 834001</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold-300" /> +91 99999 99999</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold-300" /> hello@flatsinranchi.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between text-xs text-cream/60">
          <div>© {new Date().getFullYear()} FlatsInRanchi. All rights reserved.</div>
          <div className="flex gap-5 mt-2 md:mt-0"><span>Privacy</span><span>Terms</span><span>RERA Compliance</span></div>
        </div>
      </div>
    </footer>
  )
}
