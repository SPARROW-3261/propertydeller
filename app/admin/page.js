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

const getDefaultPropertyForm = () => ({
  title: '',
  locality: '',
  bhk: '3',
  area: '',
  priceLakhs: '',
  pricePerSqft: '',
  possession: 'Ready to Move',
  rera: '',
  tagline: '',
  description: '',
  imageUrl: '',
  images: []
})

const slugify = (value = '') => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function AdminPage() {
  const [token, setToken] = useState(null)
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({})
  const [filter, setFilter] = useState('all')
  const [activeLead, setActiveLead] = useState(null)
  const [note, setNote] = useState('')
  const [properties, setProperties] = useState([])
  const [propertyForm, setPropertyForm] = useState(getDefaultPropertyForm())
  const [selectedFiles, setSelectedFiles] = useState([])
  const [propertySaving, setPropertySaving] = useState(false)

  const addImage = async () => {
    const url = propertyForm.imageUrl?.trim()
    if (url) {
      if (propertyForm.images.includes(url)) {
        toast.error('This image URL is already added')
        return
      }
      setPropertyForm(prev => ({ ...prev, images: [...prev.images, url], imageUrl: '' }))
      return
    }

    if (selectedFiles.length === 0) {
      toast.error('Please enter an image URL or choose files to upload')
      return
    }

    await readFilesAsDataUrls(selectedFiles)
    setSelectedFiles([])
  }

  const readFilesAsDataUrls = async (files) => {
    const readers = Array.from(files).map(file => new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Only image files are supported'))
        return
      }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    }))

    try {
      const urls = await Promise.all(readers)
      setPropertyForm(prev => {
        const newUrls = urls.filter(url => !prev.images.includes(url))
        if (newUrls.length === 0) {
          toast.error('Selected images are already added or invalid')
          return prev
        }
        return { ...prev, images: [...prev.images, ...newUrls] }
      })
    } catch (error) {
      toast.error(error.message)
    }
  }

  const removeImageUrl = (index) => {
    setPropertyForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('fir_admin_token')
      if (t) setToken(t)
    }
  }, [])

  useEffect(() => { if (token) { loadLeads(); loadProperties() } }, [token])

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

  const loadProperties = async () => {
    try {
      const res = await fetch('/api/admin/properties', { headers: { 'x-admin-token': token } })
      if (res.status === 401) { localStorage.removeItem('fir_admin_token'); setToken(null); return }
      const d = await res.json()
      setProperties(d.properties || [])
    } catch (e) { toast.error('Failed to load properties') }
  }

  const submitProperty = async (e) => {
    e.preventDefault()
    if (!propertyForm.title || !propertyForm.locality || !propertyForm.priceLakhs || !propertyForm.area) {
      toast.error('Please fill the required property fields')
      return
    }

    setPropertySaving(true)
    try {
        const payload = {
        title: propertyForm.title.trim(),
        locality: propertyForm.locality.trim(),
        bhk: Number(propertyForm.bhk || 3),
        area: Number(propertyForm.area),
        priceLakhs: Number(propertyForm.priceLakhs),
        pricePerSqft: Number(propertyForm.pricePerSqft || Math.round(Number(propertyForm.priceLakhs) * 1000 / Number(propertyForm.area))),
        possession: propertyForm.possession.trim(),
        rera: propertyForm.rera.trim(),
        tagline: propertyForm.tagline.trim() || `${propertyForm.bhk} BHK homes in ${propertyForm.locality.trim()}`,
        description: propertyForm.description.trim() || `Premium ${propertyForm.bhk} BHK property in ${propertyForm.locality.trim()}.`,
        slug: `${slugify(propertyForm.title)}-${slugify(propertyForm.locality)}`,
        localitySlug: slugify(propertyForm.locality),
        images: propertyForm.images.length ? propertyForm.images : undefined
      }

      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(payload)
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to add property')
      setProperties(prev => [d.property, ...prev])
      setPropertyForm(getDefaultPropertyForm())
      toast.success('Flat added successfully')
    } catch (e) { toast.error(e.message) } finally { setPropertySaving(false) }
  }

  const deleteProperty = async (property) => {
    if (!window.confirm(`Delete ${property.title} from listings? This cannot be undone.`)) return
    try {
      const res = await fetch('/api/admin/properties', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ id: property.id, slug: property.slug })
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to delete property')
      setProperties(prev => prev.filter(p => p.id !== property.id && p.slug !== property.slug))
      toast.success('Flat deleted successfully')
    } catch (e) {
      toast.error(e.message)
    }
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

        <div className="rounded-xl bg-white border border-navy-900/5 p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gold-700">Property Manager</div>
              <h2 className="font-display text-2xl text-navy-900">Add a new flat</h2>
              <p className="text-sm text-navy-700/70 mt-1">New listings will appear on the public properties page right away.</p>
            </div>
            <div className="text-sm text-navy-700/70">Live flats: {properties.length}</div>
          </div>

          <form onSubmit={submitProperty} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-xs">Property title</Label>
              <Input value={propertyForm.title} onChange={e => setPropertyForm(p => ({ ...p, title: e.target.value }))} placeholder="Skyline Heights" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-xs">Locality</Label>
              <Input value={propertyForm.locality} onChange={e => setPropertyForm(p => ({ ...p, locality: e.target.value }))} placeholder="Lalpur, Ranchi" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-xs">BHK</Label>
              <Input type="number" min="1" max="4" value={propertyForm.bhk} onChange={e => setPropertyForm(p => ({ ...p, bhk: e.target.value }))} placeholder="3" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-xs">Area (sqft)</Label>
              <Input type="number" value={propertyForm.area} onChange={e => setPropertyForm(p => ({ ...p, area: e.target.value }))} placeholder="1450" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-xs">Price (lakhs)</Label>
              <Input type="number" value={propertyForm.priceLakhs} onChange={e => setPropertyForm(p => ({ ...p, priceLakhs: e.target.value }))} placeholder="78" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-xs">Price / sqft</Label>
              <Input type="number" value={propertyForm.pricePerSqft} onChange={e => setPropertyForm(p => ({ ...p, pricePerSqft: e.target.value }))} placeholder="5379" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-xs">Possession</Label>
              <Input value={propertyForm.possession} onChange={e => setPropertyForm(p => ({ ...p, possession: e.target.value }))} placeholder="Ready to Move" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-xs">RERA No.</Label>
              <Input value={propertyForm.rera} onChange={e => setPropertyForm(p => ({ ...p, rera: e.target.value }))} placeholder="JHARERA/2024/0001" className="mt-1 h-11" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Tagline</Label>
              <Input value={propertyForm.tagline} onChange={e => setPropertyForm(p => ({ ...p, tagline: e.target.value }))} placeholder="Premium 3BHK homes with city views" className="mt-1 h-11" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Add image</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={propertyForm.imageUrl}
                  onChange={e => setPropertyForm(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://example.com/1.jpg"
                  className="flex-1 h-11"
                />
                <Button type="button" onClick={addImage} className="h-11 bg-gold text-navy-900">Add image</Button>
              </div>
              <div className="mt-3">
                <Label className="text-xs">Upload from device</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files))
                    }
                  }}
                  className="mt-1 block w-full text-sm text-navy-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-navy-900 file:text-white"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-xs text-navy-700/70">
                    Selected files: {selectedFiles.map(file => file.name).join(', ')}
                  </div>
                )}
              </div>
              <p className="text-xs text-navy-700/60 mt-2">Use the URL field or select files. Then click Add image to submit whichever you entered.</p>
              {propertyForm.images.length > 0 && (
                <div className="mt-3 grid gap-2">
                  {propertyForm.images.map((src, index) => (
                    <div key={src} className="flex items-center gap-3 rounded-xl border border-navy-900/5 p-3 bg-cream-50">
                      <img src={src} alt={`Preview ${index + 1}`} className="h-14 w-20 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-navy-900 truncate">{src}</div>
                        <div className="text-xs text-navy-700/70">Image {index + 1}</div>
                      </div>
                      <Button type="button" variant="outline" className="h-10 px-3" onClick={() => removeImageUrl(index)}>Delete</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={propertyForm.description} onChange={e => setPropertyForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Describe the flat, amenities, and highlights." className="mt-1" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={propertySaving} className="bg-navy-900 text-white">
                {propertySaving ? 'Adding flat...' : 'Add flat'}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-xl bg-white border border-navy-900/5 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-navy-900">Recently added flats</h3>
            <div className="text-sm text-navy-700/70">{properties.length} total</div>
          </div>
          {properties.length === 0 ? (
            <div className="text-sm text-navy-700/60">No flats added yet.</div>
          ) : (
            <div className="grid gap-3">{properties.slice(0, 6).map(p => (
              <div key={p.id || p.slug} className="flex flex-col gap-3 rounded-lg border border-navy-900/5 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-navy-900">{p.title}</div>
                    <div className="text-sm text-navy-700/70">{p.builder} • {p.locality}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gold-700">₹{p.priceLakhs} L</div>
                    <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => deleteProperty(p)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}</div>
          )}
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
