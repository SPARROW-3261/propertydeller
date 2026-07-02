'use client'

import { useEffect, useState } from 'react'
import SiteHeader from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Lock, Phone, Mail, User, IndianRupee, MessageSquare, Building2, Loader2 } from 'lucide-react'

const STATUSES = [
  { v: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { v: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { v: 'qualified', label: 'Qualified', color: 'bg-indigo-100 text-indigo-800' },
  { v: 'site_visit', label: 'Site Visit', color: 'bg-purple-100 text-purple-800' },
  { v: 'booking', label: 'Booking', color: 'bg-green-100 text-green-800' },
  { v: 'closed', label: 'Closed', color: 'bg-gray-200 text-gray-700' }
]

export default function AdminPage() {
  const [token, setToken] = useState(null)
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({})
  const [filter, setFilter] = useState('all')
  const [activeLead, setActiveLead] = useState(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('fir_admin_token')
      if (t) setToken(t)
    }
  }, [])

  useEffect(() => { if (token) loadLeads() }, [token])

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Login failed')
      localStorage.setItem('fir_admin_token', d.token)
      setToken(d.token)
      toast.success('Welcome back, admin!')
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }

  const loadLeads = async () => {
    try {
      const res = await fetch('/api/admin/leads', { headers: { 'x-admin-token': token } })
      if (res.status === 401) { localStorage.removeItem('fir_admin_token'); setToken(null); return }
      const d = await res.json()
      setLeads(d.leads || [])
      setStats(d.stats || {})
    } catch (e) { toast.error('Failed to load leads') }
  }

  const updateLead = async (id, payload) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify(payload) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Update failed')
      await loadLeads()
      if (activeLead) setActiveLead(d.lead)
      toast.success('Lead updated')
    } catch (e) { toast.error(e.message) }
  }

  const logout = () => { localStorage.removeItem('fir_admin_token'); setToken(null); setLeads([]) }

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  if (!token) {
    return (
      <div className="min-h-screen bg-cream">
        <SiteHeader />
        <div className="container py-20 max-w-md">
          <div className="rounded-2xl bg-white border border-navy-900/5 shadow-sm p-8">
            <div className="w-12 h-12 rounded-lg gold-gradient grid place-items-center text-navy-900 mb-5"><Lock className="w-5 h-5" /></div>
            <h1 className="font-display text-3xl text-navy-900">Admin Login</h1>
            <p className="text-sm text-navy-700/70 mt-1">Enter your admin password to access the CRM dashboard.</p>
            <form onSubmit={login} className="mt-6 space-y-3">
              <div>
                <Label className="text-xs text-navy-700">Password</Label>
                <Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" className="mt-1 h-11" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-navy-900 text-white">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <SiteHeader />
      <div className="container py-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-gold-700">CRM Dashboard</div>
            <h1 className="font-display text-4xl text-navy-900">Lead Pipeline</h1>
          </div>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total || 0, key: 'all' },
            { label: 'New', value: stats.new || 0, key: 'new' },
            { label: 'Contacted', value: stats.contacted || 0, key: 'contacted' },
            { label: 'Qualified', value: stats.qualified || 0, key: 'qualified' },
            { label: 'Site Visit', value: stats.siteVisit || 0, key: 'site_visit' },
            { label: 'Booking', value: stats.booking || 0, key: 'booking' },
            { label: 'Closed', value: stats.closed || 0, key: 'closed' }
          ].map((s, i) => (
            <button key={i} onClick={() => setFilter(s.key)} className={`text-left p-4 rounded-xl border transition ${filter === s.key ? 'bg-navy-900 text-white border-navy-900' : 'bg-white border-navy-900/5 hover:border-gold-300'}`}>
              <div className="text-[11px] uppercase tracking-wider opacity-70">{s.label}</div>
              <div className="font-display text-3xl mt-0.5">{s.value}</div>
            </button>
          ))}
        </div>

        {/* LEADS TABLE */}
        <div className="rounded-xl bg-white border border-navy-900/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-xs uppercase text-navy-700/70">
                <tr>
                  <th className="text-left p-4">Lead</th>
                  <th className="text-left p-4">Property</th>
                  <th className="text-left p-4">Source</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-navy-700/60">No leads {filter !== 'all' ? `in ${filter}` : 'yet'}. Submit a test enquiry from the homepage to see it here.</td></tr>
                )}
                {filteredLeads.map(l => {
                  const st = STATUSES.find(s => s.v === l.status) || STATUSES[0]
                  return (
                    <tr key={l.id} className="border-t border-navy-900/5 hover:bg-cream-100/50">
                      <td className="p-4">
                        <div className="font-semibold text-navy-900">{l.name}</div>
                        <div className="text-xs text-navy-700/70">{l.mobile} • {l.email || '—'}</div>
                        {l.budget && <div className="text-xs text-gold-700 mt-0.5">Budget: {l.budget}</div>}
                      </td>
                      <td className="p-4 text-navy-800">{l.propertyTitle || <span className="text-navy-700/60">General</span>}</td>
                      <td className="p-4 text-xs text-navy-700/70">{l.source}</td>
                      <td className="p-4">
                        <Select value={l.status} onValueChange={v => updateLead(l.id, { status: v })}>
                          <SelectTrigger className={`h-8 w-[120px] text-xs ${st.color} border-0`}>{st.label}</SelectTrigger>
                          <SelectContent>{STATUSES.map(s => <SelectItem key={s.v} value={s.v}>{s.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-xs text-navy-700/70">{new Date(l.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td className="p-4">
                        <Dialog>
                          <DialogTrigger asChild><Button size="sm" variant="outline" onClick={() => setActiveLead(l)}>View</Button></DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader><DialogTitle className="font-display text-2xl text-navy-900">{l.name}</DialogTitle></DialogHeader>
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold-600" /> <a href={`tel:${l.mobile}`} className="text-navy-900 hover:underline">{l.mobile}</a></div>
                              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold-600" /> {l.email || 'No email'}</div>
                              <div className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-gold-600" /> {l.budget || 'Not specified'}</div>
                              <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gold-600" /> {l.propertyTitle || 'General enquiry'}</div>
                              {l.message && <div className="p-3 rounded-lg bg-cream-100 text-navy-800"><div className="text-xs uppercase tracking-wider text-navy-700/60 mb-1">Message</div>{l.message}</div>}
                              <div>
                                <div className="text-xs uppercase tracking-wider text-navy-700/60 mb-2">Notes</div>
                                {(l.notes || []).length === 0 && <div className="text-xs text-navy-700/60">No notes yet</div>}
                                {(l.notes || []).map((n, i) => (
                                  <div key={i} className="text-xs p-2 rounded bg-cream-100 mb-1">{n.text} <span className="text-navy-700/50">— {new Date(n.at).toLocaleString('en-IN')}</span></div>
                                ))}
                                <div className="flex gap-2 mt-2">
                                  <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." rows={2} />
                                  <Button size="sm" onClick={async () => { if (note.trim()) { await updateLead(l.id, { note: note.trim() }); setNote('') } }}>Add</Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
