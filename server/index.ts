import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_SERVICES, getActiveServices } from './services.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'peach-dev-secret-change-me';

const BUSINESS_NAME   = process.env.BUSINESS_NAME   || 'My Business';
const OWNER_EMAIL     = process.env.OWNER_EMAIL     || 'owner@example.com';
const OWNER_PASSWORD  = process.env.OWNER_PASSWORD  || 'changeme123';
const INDUSTRY        = process.env.INDUSTRY        || 'general';
const ACTIVE_SERVICES = (process.env.ACTIVE_SERVICES || 'crm_dashboard').split(',').map(s => s.trim()).filter(Boolean);

const DATA_DIR = '/data';
const DB_PATH  = path.join(DATA_DIR, 'client.db');
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'owner', created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT, phone TEXT, notes TEXT, status TEXT DEFAULT 'active', tags TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, client_name TEXT, service TEXT, date TEXT, time TEXT, status TEXT DEFAULT 'scheduled', notes TEXT, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, client_name TEXT, amount REAL NOT NULL, status TEXT DEFAULT 'pending', description TEXT, due_date TEXT, paid_date TEXT, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS active_services (service_id TEXT PRIMARY KEY, enabled_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS booking_slots (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, time TEXT NOT NULL, duration_min INTEGER DEFAULT 60, is_blocked INTEGER DEFAULT 0, appointment_id INTEGER);
  CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, client_name TEXT, rating INTEGER, platform TEXT DEFAULT 'google', body TEXT, status TEXT DEFAULT 'pending', created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS campaigns (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, type TEXT, status TEXT DEFAULT 'draft', subject TEXT, body TEXT, sent_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS followups (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, client_name TEXT, type TEXT, message TEXT, status TEXT DEFAULT 'pending', scheduled_at TEXT, sent_at TEXT, created_at TEXT DEFAULT (datetime('now')));
`);

// Boot-time seed — always runs to enforce correct credentials
const hash = bcrypt.hashSync(OWNER_PASSWORD, 10);
db.prepare(`INSERT INTO users (name,email,password,role) VALUES (?,?,?,'owner') ON CONFLICT(email) DO UPDATE SET password=excluded.password, name=excluded.name`).run(BUSINESS_NAME + ' Owner', OWNER_EMAIL, hash);

const ups = db.prepare(`INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`);
ups.run('business_name', BUSINESS_NAME); ups.run('industry', INDUSTRY); ups.run('owner_email', OWNER_EMAIL);

db.prepare('DELETE FROM active_services').run();
for (const svc of [...new Set(['crm_dashboard', ...ACTIVE_SERVICES])]) {
  if (ALL_SERVICES.find(s => s.id === svc)) db.prepare('INSERT OR IGNORE INTO active_services(service_id) VALUES(?)').run(svc);
}

const cc = (db.prepare('SELECT COUNT(*) as c FROM clients').get() as any).c;
if (cc === 0) {
  const ins = db.prepare('INSERT INTO clients(name,email,phone) VALUES(?,?,?)');
  [['Sarah Johnson','sarah@example.com','404-555-0101'],['Marcus Williams','marcus@example.com','404-555-0102'],['Emily Chen','emily@example.com','404-555-0103'],['David Brown','david@example.com','404-555-0104'],['Lisa Garcia','lisa@example.com','404-555-0105']].forEach(([n,e,p])=>ins.run(n,e,p));
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO appointments(client_id,client_name,service,date,time,status) VALUES(?,?,?,?,?,?)').run(1,'Sarah Johnson','Consultation',today,'10:00 AM','scheduled');
  db.prepare('INSERT INTO appointments(client_id,client_name,service,date,time,status) VALUES(?,?,?,?,?,?)').run(2,'Marcus Williams','Follow-up',today,'2:00 PM','scheduled');
  db.prepare('INSERT INTO invoices(client_id,client_name,amount,status,description) VALUES(?,?,?,?,?)').run(1,'Sarah Johnson',150,'paid','Initial setup');
  db.prepare('INSERT INTO invoices(client_id,client_name,amount,status,description) VALUES(?,?,?,?,?)').run(3,'Emily Chen',75,'pending','Monthly service');
  db.prepare('INSERT INTO invoices(client_id,client_name,amount,status,description) VALUES(?,?,?,?,?)').run(4,'David Brown',200,'pending','Custom project');
}

app.use(cors()); app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

function gate(svcId: string) {
  return (_req: any, res: any, next: any) => {
    const active = (db.prepare('SELECT service_id FROM active_services').all() as any[]).map(r => r.service_id);
    if (!active.includes(svcId)) return res.status(403).json({ error: 'Service not active', service: svcId });
    next();
  };
}

app.get('/api/health', (_req, res) => res.json({ ok: true, business: BUSINESS_NAME }));

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
app.get('/api/auth/me', auth, (req: any, res) => res.json(db.prepare('SELECT id,name,email,role FROM users WHERE id=?').get(req.user.id)));

app.get('/api/settings', auth, (_req, res) => { const rows = db.prepare('SELECT key,value FROM settings').all() as any[]; const s: any = {}; rows.forEach(r => s[r.key]=r.value); res.json(s); });
app.put('/api/settings', auth, (req, res) => { for (const [k,v] of Object.entries(req.body)) if (v !== undefined) ups.run(k, v as string); res.json({ ok: true }); });

app.get('/api/services', auth, (_req, res) => {
  const active = (db.prepare('SELECT service_id FROM active_services').all() as any[]).map(r => r.service_id);
  res.json({ active, all: ALL_SERVICES, activeServices: getActiveServices(active) });
});

app.get('/api/dashboard', auth, (_req, res) => {
  const totalClients    = (db.prepare('SELECT COUNT(*) as c FROM clients WHERE status="active"').get() as any).c;
  const todayAppts      = (db.prepare("SELECT COUNT(*) as c FROM appointments WHERE date=date('now') AND status='scheduled'").get() as any).c;
  const pendingInvoices = (db.prepare("SELECT COUNT(*) as c FROM invoices WHERE status='pending'").get() as any).c;
  const revenue         = (db.prepare("SELECT COALESCE(SUM(amount),0) as t FROM invoices WHERE status='paid'").get() as any).t;
  const recentClients   = db.prepare('SELECT * FROM clients ORDER BY created_at DESC LIMIT 5').all();
  const upcomingAppts   = db.prepare("SELECT * FROM appointments WHERE date>=date('now') AND status='scheduled' ORDER BY date,time LIMIT 5").all();
  res.json({ totalClients, todayAppts, pendingInvoices, revenue, recentClients, upcomingAppts });
});

app.get('/api/clients', auth, (_req, res) => res.json(db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all()));
app.post('/api/clients', auth, (req, res) => { const { name,email,phone,notes,tags } = req.body; const r = db.prepare('INSERT INTO clients(name,email,phone,notes,tags) VALUES(?,?,?,?,?)').run(name,email||'',phone||'',notes||'',tags||''); res.json(db.prepare('SELECT * FROM clients WHERE id=?').get(r.lastInsertRowid)); });
app.put('/api/clients/:id', auth, (req, res) => { const { name,email,phone,notes,status,tags } = req.body; db.prepare('UPDATE clients SET name=?,email=?,phone=?,notes=?,status=?,tags=? WHERE id=?').run(name,email,phone,notes,status||'active',tags||'',req.params.id); res.json(db.prepare('SELECT * FROM clients WHERE id=?').get(req.params.id)); });
app.delete('/api/clients/:id', auth, (req, res) => { db.prepare('DELETE FROM clients WHERE id=?').run(req.params.id); res.json({ ok:true }); });

app.get('/api/appointments', auth, (_req, res) => res.json(db.prepare('SELECT * FROM appointments ORDER BY date DESC,time DESC').all()));
app.post('/api/appointments', auth, (req, res) => { const { client_id,client_name,service,date,time,notes,status } = req.body; const r = db.prepare('INSERT INTO appointments(client_id,client_name,service,date,time,notes,status) VALUES(?,?,?,?,?,?,?)').run(client_id,client_name,service,date,time,notes||'',status||'scheduled'); res.json(db.prepare('SELECT * FROM appointments WHERE id=?').get(r.lastInsertRowid)); });
app.put('/api/appointments/:id', auth, (req, res) => { const { client_name,service,date,time,status,notes } = req.body; db.prepare('UPDATE appointments SET client_name=?,service=?,date=?,time=?,status=?,notes=? WHERE id=?').run(client_name,service,date,time,status,notes||'',req.params.id); res.json(db.prepare('SELECT * FROM appointments WHERE id=?').get(req.params.id)); });
app.delete('/api/appointments/:id', auth, (req, res) => { db.prepare('DELETE FROM appointments WHERE id=?').run(req.params.id); res.json({ ok:true }); });

app.get('/api/invoices', auth, (_req, res) => res.json(db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all()));
app.post('/api/invoices', auth, (req, res) => { const { client_id,client_name,amount,description,due_date } = req.body; const r = db.prepare('INSERT INTO invoices(client_id,client_name,amount,description,due_date) VALUES(?,?,?,?,?)').run(client_id,client_name,amount,description||'',due_date||''); res.json(db.prepare('SELECT * FROM invoices WHERE id=?').get(r.lastInsertRowid)); });
app.put('/api/invoices/:id', auth, (req, res) => { const { client_name,amount,status,description,due_date,paid_date } = req.body; db.prepare('UPDATE invoices SET client_name=?,amount=?,status=?,description=?,due_date=?,paid_date=? WHERE id=?').run(client_name,amount,status,description,due_date,paid_date||null,req.params.id); res.json(db.prepare('SELECT * FROM invoices WHERE id=?').get(req.params.id)); });
app.delete('/api/invoices/:id', auth, (req, res) => { db.prepare('DELETE FROM invoices WHERE id=?').run(req.params.id); res.json({ ok:true }); });

app.get('/api/bookings/slots', auth, gate('booking_calendar'), (req, res) => { const { date } = req.query as any; const slots = date ? db.prepare('SELECT * FROM booking_slots WHERE date=? ORDER BY time').all(date) : db.prepare("SELECT * FROM booking_slots WHERE date>=date('now') ORDER BY date,time LIMIT 50").all(); res.json(slots); });
app.post('/api/bookings/slots', auth, gate('booking_calendar'), (req, res) => { const { date,time,duration_min } = req.body; const r = db.prepare('INSERT INTO booking_slots(date,time,duration_min) VALUES(?,?,?)').run(date,time,duration_min||60); res.json(db.prepare('SELECT * FROM booking_slots WHERE id=?').get(r.lastInsertRowid)); });
app.post('/api/bookings/request', gate('booking_calendar'), (req, res) => { const { client_name,client_email,client_phone,service,date,time,notes } = req.body; if (!client_name||!date||!time) return res.status(400).json({ error:'Missing required fields' }); let client = db.prepare('SELECT * FROM clients WHERE email=?').get(client_email) as any; if (!client&&client_email) { const r = db.prepare('INSERT INTO clients(name,email,phone) VALUES(?,?,?)').run(client_name,client_email,client_phone||''); client = db.prepare('SELECT * FROM clients WHERE id=?').get(r.lastInsertRowid); } const r = db.prepare('INSERT INTO appointments(client_id,client_name,service,date,time,notes,status) VALUES(?,?,?,?,?,?,?)').run(client?.id||null,client_name,service||'Appointment',date,time,notes||'','requested'); res.json({ ok:true, appointment_id:r.lastInsertRowid }); });

app.get('/api/reminders', auth, gate('appt_reminders'), (_req, res) => { const rows = db.prepare("SELECT * FROM appointments WHERE date BETWEEN date('now') AND date('now','+3 days') AND status IN ('scheduled','requested') ORDER BY date,time").all(); res.json(rows); });
app.post('/api/reminders/send', auth, gate('appt_reminders'), (req, res) => res.json({ ok:true, sent:true, appointment_id:req.body.appointment_id, note:'Configure TWILIO_SID/RESEND_API_KEY to activate' }));

app.get('/api/reviews', auth, gate('review_management'), (_req, res) => res.json(db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all()));
app.post('/api/reviews/request', auth, gate('review_management'), (req, res) => { const r = db.prepare('INSERT INTO reviews(client_id,client_name,status) VALUES(?,?,?)').run(req.body.client_id,req.body.client_name,'requested'); res.json({ ok:true, id:r.lastInsertRowid }); });
app.post('/api/reviews', auth, gate('review_management'), (req, res) => { const { client_id,client_name,rating,platform,body } = req.body; const r = db.prepare('INSERT INTO reviews(client_id,client_name,rating,platform,body,status) VALUES(?,?,?,?,?,?)').run(client_id,client_name,rating,platform||'google',body||'','published'); res.json(db.prepare('SELECT * FROM reviews WHERE id=?').get(r.lastInsertRowid)); });

app.get('/api/followups', auth, gate('auto_followup'), (_req, res) => res.json(db.prepare('SELECT * FROM followups ORDER BY created_at DESC').all()));
app.post('/api/followups', auth, gate('auto_followup'), (req, res) => { const { client_id,client_name,type,message,scheduled_at } = req.body; const r = db.prepare('INSERT INTO followups(client_id,client_name,type,message,scheduled_at) VALUES(?,?,?,?,?)').run(client_id,client_name,type||'sms',message,scheduled_at||new Date().toISOString()); res.json(db.prepare('SELECT * FROM followups WHERE id=?').get(r.lastInsertRowid)); });
app.put('/api/followups/:id/send', auth, gate('auto_followup'), (req, res) => { db.prepare("UPDATE followups SET status='sent',sent_at=datetime('now') WHERE id=?").run(req.params.id); res.json({ ok:true, note:'Configure TWILIO_SID/RESEND_API_KEY to activate' }); });

app.get('/api/campaigns', auth, gate('email_sms_marketing'), (_req, res) => res.json(db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all()));
app.post('/api/campaigns', auth, gate('email_sms_marketing'), (req, res) => { const { name,type,subject,body } = req.body; const r = db.prepare('INSERT INTO campaigns(name,type,subject,body) VALUES(?,?,?,?)').run(name,type||'email',subject||'',body||''); res.json(db.prepare('SELECT * FROM campaigns WHERE id=?').get(r.lastInsertRowid)); });
app.put('/api/campaigns/:id/send', auth, gate('email_sms_marketing'), (_req, res) => { const cnt = (db.prepare('SELECT COUNT(*) as c FROM clients WHERE status="active"').get() as any).c; db.prepare("UPDATE campaigns SET status='sent',sent_count=? WHERE id=?").run(cnt,_req.params.id); res.json({ ok:true, sent_count:cnt, note:'Configure RESEND_API_KEY to activate' }); });

app.get('/api/chat/config', auth, gate('ai_chat_widget'), (_req, res) => { const s: any = {}; (db.prepare('SELECT key,value FROM settings').all() as any[]).forEach((r:any)=>s[r.key]=r.value); res.json({ business_name:s.business_name, industry:s.industry, enabled:true }); });
app.get('/api/seo/status', auth, gate('local_seo'), (_req, res) => res.json({ status:'active', gmb_connected:false, note:'Connect Google My Business via GOOGLE_MAPS_API_KEY' }));
app.get('/api/social/templates', auth, gate('social_templates'), (_req, res) => { const t = Array.from({length:20},(_,i)=>({id:i+1,name:'Template '+(i+1),platform:i%2===0?'instagram':'facebook',category:['promo','seasonal','review','announcement'][i%4]})); res.json(t); });
app.get('/api/support/status', auth, gate('priority_support'), (_req, res) => res.json({ tier:'priority', response_sla:'24h' }));

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../client/index.html')));

app.listen(PORT, () => console.log(`[Peach Stack] ${BUSINESS_NAME} running on :${PORT}`));
