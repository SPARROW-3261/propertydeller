import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { PROPERTIES, BUILDERS, LOCALITIES } from '@/lib/seed-data'

let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL, { serverSelectionTimeoutMS: 1500 })
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token')
  return res
}

export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

function clean(doc) { if (!doc) return doc; const { _id, ...rest } = doc; return rest }

async function ensureSeed(db) {
  const count = await db.collection('properties').countDocuments()
  if (count === 0) {
    const now = new Date()
    const props = PROPERTIES.map(p => ({ id: uuidv4(), ...p, createdAt: now }))
    await db.collection('properties').insertMany(props)
    const builders = BUILDERS.map(b => ({ id: uuidv4(), ...b, createdAt: now }))
    await db.collection('builders').insertMany(builders)
    const locs = LOCALITIES.map(l => ({ id: uuidv4(), ...l, createdAt: now }))
    await db.collection('localities').insertMany(locs)
    return { seeded: true, properties: props.length }
  }
  return { seeded: false, properties: count }
}

async function sendLeadEmail(lead, property) {
  if (!process.env.RESEND_API_KEY) return { sent: false, reason: 'no_api_key' }
  try {
    const to = process.env.LEAD_NOTIFICATION_EMAIL || 'delivered@resend.dev'
    const from = process.env.FROM_EMAIL || 'FlatsInRanchi <onboarding@resend.dev>'
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#FAFAF9;padding:24px;border-radius:8px;border:1px solid #e5e5e0">
        <div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #C9A227">
          <h1 style="font-family:Georgia,serif;color:#0F172A;margin:0;font-size:24px">FlatsInRanchi</h1>
          <p style="color:#C9A227;margin:6px 0 0;font-size:12px;letter-spacing:2px">NEW LEAD ALERT</p>
        </div>
        <h2 style="color:#0F172A;font-family:Georgia,serif">A new lead just came in</h2>
        <table style="width:100%;font-size:14px;color:#1E293B">
          <tr><td style="padding:6px 0;width:120px;color:#64748B">Name</td><td><strong>${escapeHtml(lead.name)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#64748B">Mobile</td><td>${escapeHtml(lead.mobile)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B">Email</td><td>${escapeHtml(lead.email || 'Not provided')}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B">Budget</td><td>${escapeHtml(lead.budget || 'Not specified')}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B">Property</td><td>${escapeHtml(property ? property.title + ' — ' + property.locality : (lead.propertySlug || 'General enquiry'))}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B">Source</td><td>${escapeHtml(lead.source)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B;vertical-align:top">Message</td><td>${escapeHtml(lead.message || '—')}</td></tr>
        </table>
        <div style="margin-top:24px;padding:14px;background:#0F172A;color:#FAFAF9;border-radius:6px;text-align:center;font-size:13px">
          Respond within 30 minutes for the best conversion rates.
        </div>
      </div>`
    const subj = `New lead: ${lead.name} — ${property ? property.title : (lead.source || 'enquiry')}`
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject: subj, html })
    })
    const result = await res.json().catch(() => ({}))
    return { sent: res.ok, id: result?.id, error: result?.message || result?.error }
  } catch (e) {
    return { sent: false, error: e.message }
  }
}

function escapeHtml(s='') { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

function matchesProperty(property, q) {
  if (q.get('locality') && property.localitySlug !== q.get('locality')) return false
  if (q.get('builder') && property.builderSlug !== q.get('builder')) return false
  if (q.get('bhk') && property.bhk !== parseInt(q.get('bhk'))) return false
  if (q.get('possession') && property.possession !== q.get('possession')) return false
  if (q.get('verified') === 'true' && !property.verified) return false

  const minBudget = q.get('minBudget') ? parseInt(q.get('minBudget')) : null
  const maxBudget = q.get('maxBudget') ? parseInt(q.get('maxBudget')) : null
  if (minBudget && property.priceLakhs < minBudget) return false
  if (maxBudget && property.priceLakhs > maxBudget) return false

  const search = q.get('q')?.trim().toLowerCase()
  if (!search) return true

  return [property.title, property.locality, property.builder, property.tagline]
    .some(value => value?.toLowerCase().includes(search))
}

function sortProperties(properties, sort = 'recommended') {
  return [...properties].sort((a, b) => {
    if (sort === 'priceAsc') return a.priceLakhs - b.priceLakhs
    if (sort === 'priceDesc') return b.priceLakhs - a.priceLakhs
    return Number(b.verified) - Number(a.verified)
  })
}

function fallbackRoute(route, method, url, path) {
  if ((route === '/' || route === '/health') && method === 'GET') {
    return cors(NextResponse.json({ ok: true, service: 'flatsinranchi', source: 'fallback', time: new Date().toISOString() }))
  }

  if (route === '/properties' && method === 'GET') {
    const q = url.searchParams
    const properties = sortProperties(PROPERTIES.filter(property => matchesProperty(property, q)), q.get('sort') || 'recommended').slice(0, 60)
    return cors(NextResponse.json({ properties, total: properties.length, source: 'fallback' }))
  }

  if (path[0] === 'properties' && path[1] && method === 'GET' && path.length === 2) {
    const property = PROPERTIES.find(item => item.slug === path[1])
    if (!property) return cors(NextResponse.json({ error: 'Property not found' }, { status: 404 }))
    const related = PROPERTIES.filter(item => item.localitySlug === property.localitySlug && item.slug !== property.slug).slice(0, 3)
    return cors(NextResponse.json({ property, related, source: 'fallback' }))
  }

  if (route === '/builders' && method === 'GET') {
    const builders = BUILDERS.map(builder => ({
      ...builder,
      activeProjects: PROPERTIES.filter(property => property.builderSlug === builder.slug).length
    }))
    return cors(NextResponse.json({ builders, source: 'fallback' }))
  }

  if (route === '/localities' && method === 'GET') {
    const localities = LOCALITIES.map(locality => ({
      ...locality,
      count: PROPERTIES.filter(property => property.localitySlug === locality.slug).length || locality.count
    }))
    return cors(NextResponse.json({ localities, source: 'fallback' }))
  }

  return null
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method
  const url = new URL(request.url)

  try {
    let db
    try {
      db = await connectToMongo()
      await ensureSeed(db)
    } catch (mongoError) {
      const fallback = fallbackRoute(route, method, url, path)
      if (fallback) return fallback
      throw mongoError
    }

    if ((route === '/' || route === '/health') && method === 'GET') {
      return cors(NextResponse.json({ ok: true, service: 'flatsinranchi', time: new Date().toISOString() }))
    }

    if (route === '/seed' && method === 'POST') {
      // Force re-seed (drops then inserts)
      await db.collection('properties').deleteMany({})
      await db.collection('builders').deleteMany({})
      await db.collection('localities').deleteMany({})
      const r = await ensureSeed(db)
      return cors(NextResponse.json(r))
    }

    // GET /api/properties
    if (route === '/properties' && method === 'GET') {
      const q = url.searchParams
      const filter = {}
      if (q.get('locality')) filter.localitySlug = q.get('locality')
      if (q.get('builder')) filter.builderSlug = q.get('builder')
      if (q.get('bhk')) filter.bhk = parseInt(q.get('bhk'))
      if (q.get('possession')) filter.possession = q.get('possession')
      if (q.get('verified') === 'true') filter.verified = true
      const minB = q.get('minBudget') ? parseInt(q.get('minBudget')) : null
      const maxB = q.get('maxBudget') ? parseInt(q.get('maxBudget')) : null
      if (minB || maxB) {
        filter.priceLakhs = {}
        if (minB) filter.priceLakhs.$gte = minB
        if (maxB) filter.priceLakhs.$lte = maxB
      }
      const search = q.get('q')
      if (search) {
        const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        filter.$or = [ { title: re }, { locality: re }, { builder: re }, { tagline: re } ]
      }
      const sort = q.get('sort') || 'recommended'
      const sortObj = sort === 'priceAsc' ? { priceLakhs: 1 } : sort === 'priceDesc' ? { priceLakhs: -1 } : { verified: -1, createdAt: -1 }
      const docs = await db.collection('properties').find(filter).sort(sortObj).limit(60).toArray()
      return cors(NextResponse.json({ properties: docs.map(clean), total: docs.length }))
    }

    // GET /api/properties/:slug
    if (path[0] === 'properties' && path[1] && method === 'GET' && path.length === 2) {
      const slug = path[1]
      const doc = await db.collection('properties').findOne({ slug })
      if (!doc) return cors(NextResponse.json({ error: 'Property not found' }, { status: 404 }))
      // related: same locality, exclude self
      const related = await db.collection('properties').find({ localitySlug: doc.localitySlug, slug: { $ne: slug } }).limit(3).toArray()
      return cors(NextResponse.json({ property: clean(doc), related: related.map(clean) }))
    }

    // GET /api/builders
    if (route === '/builders' && method === 'GET') {
      const docs = await db.collection('builders').find({}).toArray()
      const counts = await db.collection('properties').aggregate([{ $group: { _id: '$builderSlug', count: { $sum: 1 } } }]).toArray()
      const countMap = Object.fromEntries(counts.map(c => [c._id, c.count]))
      return cors(NextResponse.json({ builders: docs.map(d => ({ ...clean(d), activeProjects: countMap[d.slug] || 0 })) }))
    }

    // GET /api/localities
    if (route === '/localities' && method === 'GET') {
      const docs = await db.collection('localities').find({}).toArray()
      const counts = await db.collection('properties').aggregate([{ $group: { _id: '$localitySlug', count: { $sum: 1 } } }]).toArray()
      const countMap = Object.fromEntries(counts.map(c => [c._id, c.count]))
      return cors(NextResponse.json({ localities: docs.map(d => ({ ...clean(d), count: countMap[d.slug] || 0 })) }))
    }

    // POST /api/leads
    if (route === '/leads' && method === 'POST') {
      const body = await request.json()
      if (!body.name || !body.mobile) {
        return cors(NextResponse.json({ error: 'name and mobile are required' }, { status: 400 }))
      }
      const lead = {
        id: uuidv4(),
        name: String(body.name).slice(0, 100),
        mobile: String(body.mobile).slice(0, 20),
        email: body.email ? String(body.email).slice(0, 120) : null,
        budget: body.budget || null,
        propertySlug: body.propertySlug || null,
        propertyTitle: body.propertyTitle || null,
        message: body.message ? String(body.message).slice(0, 1000) : '',
        source: body.source || 'website',
        status: 'new',
        notes: [],
        createdAt: new Date()
      }
      let property = null
      if (lead.propertySlug) property = clean(await db.collection('properties').findOne({ slug: lead.propertySlug }))
      await db.collection('leads').insertOne(lead)
      const emailResult = await sendLeadEmail(lead, property)
      return cors(NextResponse.json({ ok: true, leadId: lead.id, email: emailResult }))
    }

    // POST /api/admin/login
    if (route === '/admin/login' && method === 'POST') {
      const body = await request.json()
      if (body.password === process.env.ADMIN_PASSWORD) {
        return cors(NextResponse.json({ ok: true, token: process.env.ADMIN_PASSWORD }))
      }
      return cors(NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 }))
    }

    // Admin-protected routes
    const adminToken = request.headers.get('x-admin-token')
    const isAdmin = adminToken === process.env.ADMIN_PASSWORD

    if (route === '/admin/leads' && method === 'GET') {
      if (!isAdmin) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const leads = await db.collection('leads').find({}).sort({ createdAt: -1 }).limit(500).toArray()
      const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
        siteVisit: leads.filter(l => l.status === 'site_visit').length,
        booking: leads.filter(l => l.status === 'booking').length,
        closed: leads.filter(l => l.status === 'closed').length
      }
      return cors(NextResponse.json({ leads: leads.map(clean), stats }))
    }

    if (path[0] === 'admin' && path[1] === 'leads' && path[2] && method === 'PATCH') {
      if (!isAdmin) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const id = path[2]
      const body = await request.json()
      const update = {}
      if (body.status) update.status = body.status
      if (body.note) update['$push'] = { notes: { text: body.note, at: new Date() } }
      const setUpdate = Object.keys(update).filter(k => k !== '$push').reduce((a, k) => (a[k] = update[k], a), {})
      const ops = {}
      if (Object.keys(setUpdate).length) ops.$set = setUpdate
      if (update['$push']) ops.$push = update['$push']
      if (Object.keys(ops).length) await db.collection('leads').updateOne({ id }, ops)
      const updated = await db.collection('leads').findOne({ id })
      return cors(NextResponse.json({ ok: true, lead: clean(updated) }))
    }

    if (route === '/admin/stats' && method === 'GET') {
      if (!isAdmin) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const [leads, properties, builders] = await Promise.all([
        db.collection('leads').countDocuments(),
        db.collection('properties').countDocuments(),
        db.collection('builders').countDocuments()
      ])
      return cors(NextResponse.json({ leads, properties, builders }))
    }

    return cors(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return cors(NextResponse.json({ error: 'Internal server error', detail: error.message }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
