'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Check, Loader2 } from 'lucide-react'

export default function LeadForm({ propertySlug, propertyTitle, source = 'property_enquiry', title = 'Get Best Price', subtitle, compact = false, ctaLabel = 'Request Best Price' }) {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', budget: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.mobile) { toast.error('Please enter your name and mobile'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, propertySlug, propertyTitle, source })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSent(true)
      toast.success('Enquiry submitted! Our expert will call you within 30 minutes.')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center p-8 rounded-xl bg-cream-100 border border-gold-100">
        <div className="mx-auto w-14 h-14 rounded-full bg-gold gold-gradient grid place-items-center text-white mb-4">
          <Check className="w-7 h-7" />
        </div>
        <div className="font-display text-xl text-navy-900 mb-1">Thank you!</div>
        <p className="text-sm text-navy-700">Your enquiry is in. A FlatsInRanchi expert will call you within 30 minutes.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={`${compact ? '' : 'rounded-xl bg-white p-6 shadow-sm border border-navy-900/5'}`}>
      {!compact && (
        <div className="mb-5">
          <div className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-2">Personalised assistance</div>
          <h3 className="font-display text-2xl text-navy-900">{title}</h3>
          {subtitle && <p className="text-sm text-navy-700/80 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-navy-700">Full Name *</Label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Priya Sharma" className="mt-1 h-11" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-navy-700">Mobile *</Label>
            <Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="+91 9XXXX XXXXX" className="mt-1 h-11" />
          </div>
          <div>
            <Label className="text-xs text-navy-700">Email</Label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" className="mt-1 h-11" />
          </div>
        </div>
        <div>
          <Label className="text-xs text-navy-700">Budget</Label>
          <Select value={form.budget} onValueChange={v => setForm({ ...form, budget: v })}>
            <SelectTrigger className="h-11 mt-1"><SelectValue placeholder="Select budget range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="40-60L">₹40 - 60 Lakhs</SelectItem>
              <SelectItem value="60-80L">₹60 - 80 Lakhs</SelectItem>
              <SelectItem value="80L-1Cr">₹80 Lakhs - 1 Crore</SelectItem>
              <SelectItem value="1Cr-1.5Cr">₹1 - 1.5 Crore</SelectItem>
              <SelectItem value="1.5Cr+">₹1.5 Crore +</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-navy-700">Message (optional)</Label>
          <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you're looking for..." className="mt-1" rows={3} />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold tracking-wide rounded-md">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? 'Sending...' : ctaLabel}
        </Button>
        <p className="text-[11px] text-navy-700/60 text-center pt-1">By submitting, you agree to be contacted by FlatsInRanchi.</p>
      </div>
    </form>
  )
}
