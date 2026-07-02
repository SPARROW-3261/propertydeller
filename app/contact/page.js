'use client'

import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import LeadForm from '@/components/lead-form'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <div className="bg-navy-900 text-white py-14">
        <div className="container">
          <div className="text-xs uppercase tracking-[0.25em] text-gold-300 mb-2">Get in Touch</div>
          <h1 className="font-display text-4xl md:text-5xl">Talk to a Property Expert</h1>
          <p className="text-white/70 mt-2 max-w-lg">We respond within 30 minutes during business hours. No spam, no pressure — just expert advice.</p>
        </div>
      </div>
      <div className="container py-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-3xl text-navy-900 mb-6">Contact Information</h2>
          <div className="space-y-4">
            {[
              { icon: Phone, label: 'Call us', value: '+91 99999 99999', sub: 'Mon–Sun, 9am–9pm' },
              { icon: Mail, label: 'Email', value: 'hello@flatsinranchi.com', sub: 'We respond within 2 hours' },
              { icon: MapPin, label: 'Office', value: 'Lalpur Chowk, Ranchi', sub: 'Jharkhand 834001' },
              { icon: Clock, label: 'Working Hours', value: 'Mon – Sun', sub: '9:00 AM – 9:00 PM' }
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white border border-navy-900/5">
                <div className="w-11 h-11 rounded-lg gold-gradient grid place-items-center text-navy-900"><c.icon className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-navy-700/60">{c.label}</div>
                  <div className="font-semibold text-navy-900 mt-0.5">{c.value}</div>
                  <div className="text-xs text-navy-700/70">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl overflow-hidden aspect-video bg-cream-100 border border-navy-900/5">
            <iframe title="Office Location" className="w-full h-full" loading="lazy" src="https://www.google.com/maps?q=Lalpur+Chowk+Ranchi&z=14&output=embed" />
          </div>
        </div>
        <div>
          <LeadForm source="contact_page" title="Send us a message" subtitle="We'll get back to you within 30 minutes." ctaLabel="Send Message" />
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
