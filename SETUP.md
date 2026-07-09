# PDFUniverse — Complete Setup, Deployment & Monetization Guide

---

## 📁 Complete Folder Structure

```
PDFUniverse/
├── backend/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT authenticate / requireAdmin / requirePro
│   ├── models/
│   │   └── index.js              # User · FileJob · SubscriptionEvent · AdminLog
│   ├── routes/
│   │   ├── auth.js               # /api/auth/*
│   │   ├── pdf.js                # /api/pdf/* — all PDF operations
│   │   ├── user.js               # /api/user/*
│   │   ├── admin.js              # /api/admin/* (admin-only)
│   │   └── webhook.js            # /api/webhook/stripe
│   ├── utils/
│   │   └── fileCleanup.js        # Cron: delete expired files
│   ├── uploads/                  # Temp input files (auto-cleaned)
│   ├── outputs/                  # Processed output files (auto-cleaned)
│   ├── server.js                 # App entry point
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout (Navbar + Footer)
│   │   │   ├── globals.css       # Design tokens + Tailwind base
│   │   │   ├── page.tsx          # / — Home page
│   │   │   ├── tools/
│   │   │   │   ├── page.tsx      # /tools — All tools grid
│   │   │   │   └── [toolId]/
│   │   │   │       └── page.tsx  # /tools/merge, etc.
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx      # User dashboard
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   ├── admin/
│   │   │   │   └── page.tsx      # Admin dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx
│   │   │   └── terms/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ui.tsx            # UploadZone · ProgressBar · DownloadButton · ToolCard
│   │   ├── hooks/
│   │   │   ├── useAuth.ts        # Zustand auth store
│   │   │   └── usePDFTool.ts     # Tool processing hook
│   │   └── lib/
│   │       ├── api.ts            # Axios instance + pdfApi / authApi
│   │       ├── tools.ts          # Tool metadata (id, label, icon, color, cat)
│   │       └── utils.ts          # cn() · formatBytes · savedPercent
│   ├── public/
│   │   ├── og-image.png
│   │   └── favicon.ico
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚙️ Step 1 — Prerequisites

Install these before starting:

| Tool      | Min Version | Install                          |
|-----------|-------------|----------------------------------|
| Node.js   | 18+         | https://nodejs.org               |
| npm       | 9+          | Bundled with Node                |
| MongoDB   | 7+          | Atlas (cloud) or local Docker    |
| Git       | any         | https://git-scm.com              |
| qpdf      | any         | `brew install qpdf` / `apt install qpdf` |

---

## ⚙️ Step 2 — Clone & Install

```bash
# 1. Clone the repo
git clone https://github.com/yourname/pdfuniverse.git
cd pdfuniverse

# 2. Install backend deps
cd backend
npm install

# 3. Install frontend deps
cd ../frontend
npm install
```

---

## ⚙️ Step 3 — Configure Environment

```bash
# From repo root
cp .env.example .env

# Fill in these critical values in .env:
# ─ MONGODB_URI     — MongoDB Atlas connection string
# ─ JWT_SECRET      — 64-char random hex
# ─ JWT_REFRESH_SECRET — different 64-char hex
# ─ ANTHROPIC_API_KEY  — from console.anthropic.com
# ─ STRIPE_SECRET_KEY  — from dashboard.stripe.com
# ─ STRIPE_WEBHOOK_SECRET — from Stripe CLI or dashboard

# Generate secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### MongoDB Atlas (free tier):
1. Go to https://cloud.mongodb.com → Create free cluster
2. Add your IP to Network Access
3. Create a DB user
4. Copy the connection string → paste into `MONGODB_URI`

### Anthropic API Key:
1. Go to https://console.anthropic.com
2. Create API Key → paste into `ANTHROPIC_API_KEY`

### Stripe Keys:
1. Go to https://dashboard.stripe.com
2. Developers → API Keys → copy `sk_test_...` and `pk_test_...`
3. Create products: Pro Monthly ($12), Pro Annual ($115), Team ($29)
4. Copy price IDs into the env

---

## ⚙️ Step 4 — Run Locally

### Option A: Manual (2 terminals)

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # nodemon on :5000

# Terminal 2 — Frontend
cd frontend
npm run dev        # Next.js on :3000
```

### Option B: Docker Compose (recommended)

```bash
# From repo root — starts Mongo + Redis + API + Web
docker-compose up --build

# Verify:
# Frontend: http://localhost:3000
# API:      http://localhost:5000/health
# MongoDB:  localhost:27017
```

---

## ⚙️ Step 5 — Seed Admin User

```bash
# Run once from /backend:
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
const { User } = require('./models');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.create({
    name    : 'Admin',
    email   : 'admin@pdfuniverse.app',
    password: 'Admin@1234!',
    role    : 'admin',
    plan    : 'team',
    isEmailVerified: true,
  });
  console.log('Admin user created');
  process.exit(0);
});
"
```

---

## 🚀 Step 6 — Deploy Frontend to Vercel

Vercel is the optimal host for Next.js (zero-config, CDN, edge functions).

```bash
# Install Vercel CLI
npm i -g vercel

# From /frontend directory
vercel login
vercel

# Follow prompts:
# ─ Framework: Next.js (auto-detected)
# ─ Build command: npm run build
# ─ Output dir: .next (auto)
```

### Set Environment Variables on Vercel:

Go to your project → Settings → Environment Variables and add:

```
NEXT_PUBLIC_API_URL           = https://your-api.onrender.com/api
NEXT_PUBLIC_APP_URL           = https://your-project.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
```

### Custom Domain:
Vercel Dashboard → Domains → Add `pdfuniverse.app` → update DNS.

---

## 🚀 Step 7 — Deploy Backend to Render

Render provides free + paid Node.js hosting with persistent disks.

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Starter ($7/mo) for production, Free for testing

4. Add all backend env vars in Render → Environment tab

5. Add a **Disk** for file storage:
   - Render → your service → Disks → Add Disk
   - Mount path: `/app/uploads` · Size: 10GB
   - Add another: `/app/outputs` · Size: 10GB

6. Note your service URL: `https://pdfuniverse-api.onrender.com`
   → Set as `NEXT_PUBLIC_API_URL` in Vercel

### Stripe Webhook on Render:

```bash
# Install Stripe CLI for local testing
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:5000/api/webhook/stripe

# For production, in Stripe Dashboard:
# Webhooks → Add endpoint → https://your-api.onrender.com/api/webhook/stripe
# Events: customer.subscription.created, .updated, .deleted
```

---

## 🚀 Alternative: Deploy Both on Railway

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login
railway init

# Deploy backend
cd backend && railway up

# Deploy frontend
cd ../frontend && railway up

# Set env vars
railway variables set JWT_SECRET=... MONGODB_URI=...
```

---

## 🚀 Alternative: VPS (DigitalOcean / Hetzner)

```bash
# On your VPS (Ubuntu 22.04):
curl -fsSL https://get.docker.com | sh
git clone https://github.com/yourname/pdfuniverse.git
cd pdfuniverse
cp .env.example .env  # fill in values
docker-compose up -d --build

# SSL with Nginx + Certbot:
apt install nginx certbot python3-certbot-nginx
certbot --nginx -d pdfuniverse.app -d api.pdfuniverse.app

# Nginx config for frontend:
# server {
#   server_name pdfuniverse.app;
#   location / { proxy_pass http://localhost:3000; }
# }
#
# Nginx config for API:
# server {
#   server_name api.pdfuniverse.app;
#   client_max_body_size 2g;
#   location / { proxy_pass http://localhost:5000; }
# }
```

---

## 🔒 Production Security Checklist

```
✅ HTTPS everywhere (Vercel handles frontend, use Render/Nginx for API)
✅ Helmet.js enabled (already configured in server.js)
✅ Rate limiting per IP and per endpoint
✅ JWT secret rotation strategy
✅ CORS restricted to known origins
✅ Files auto-deleted after 1 hour (cron job active)
✅ MongoDB Atlas IP whitelist
✅ Stripe webhook signature verification
✅ No sensitive data in error messages (production mode)
✅ qpdf for AES-256 PDF encryption
✅ Dependency audit: run `npm audit` before each deploy
```

---

## 💰 Monetization Strategy

### Tier Structure (Freemium SaaS)

| Plan     | Price      | Target Customer        | Key Limits            |
|----------|------------|------------------------|-----------------------|
| Free     | $0/forever | Casual users, students | 5 tasks/day, 50MB     |
| Pro      | $12/mo     | Freelancers, SMBs      | Unlimited, 2GB, AI    |
| Team     | $29/mo     | Agencies, enterprises  | 10 seats, SSO, API    |

### Revenue Levers

**1. Usage Limits (Freemium Pressure)**
- Free users hit the 5-task wall frequently → natural upgrade prompt
- Show upgrade banner in real-time when limit is reached

**2. Feature Gating (Value Ladder)**
- Free: Merge, Split, Compress, basic Convert
- Pro: OCR, AI Summarize, AI Q&A, E-signature, Batch, API, no watermarks
- Team: White-labeling, SSO, team dashboard, SLA

**3. API Monetization**
- Expose `/api/pdf/*` with API key auth for developers
- Charge per-operation: $0.01/merge, $0.05/OCR, $0.10/AI request
- Create a developer tier at $49/mo with 5,000 API calls

**4. Annual Discount**
- Pro Annual: $115/yr (≈ $9.58/mo, saves 20%) — reduces churn dramatically
- Promotes 12-month LTV upfront

**5. Affiliate & Referral**
- 30% commission for affiliates on first 3 months
- Give referred users 10 free bonus tasks

**6. White-Label / Custom Domain**
- Enterprise: $199/mo — custom domain, branded PDF output, private cloud
- Target: law firms, accounting firms, HR platforms

**7. Conversion Optimization**
- A/B test upgrade CTAs (pricing page, tool page, limit reached banner)
- Exit-intent modal with 10% discount
- Free trial: 7 days of Pro with no credit card

### Revenue Projections (realistic)

```
Month 6  (3,000 free, 150 pro):  ~$1,800 MRR
Month 12 (12,000 free, 500 pro): ~$6,000 MRR
Month 18 (35,000 free, 1,200 pro + 40 team): ~$15,560 MRR
```

### Key SaaS Metrics to Track

- **MRR** (Monthly Recurring Revenue)
- **Churn rate** — target <5%/month
- **CAC** (Customer Acquisition Cost) — keep <$25 via organic/SEO
- **LTV** (Lifetime Value) — target >$100
- **Free-to-paid conversion** — target 3–5%
- **Daily active tools** — indicates stickiness

### Growth Channels

1. **SEO** — Target: "merge PDF free", "PDF to Word", "compress PDF online"
   - Each tool page is a dedicated SEO landing page
   - Build 100+ blog posts: "How to merge PDFs on Mac", etc.

2. **Product Hunt** — Launch on Day 1, aim for Top 5

3. **Integrations** — Zapier/Make.com connectors for automation users

4. **Chrome Extension** — "Right-click any PDF → Open in PDFUniverse"

5. **AppSumo** — Lifetime deal for initial MRR + user base

---

## 📊 Key API Endpoints Reference

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me

POST /api/pdf/merge          # files[] (multipart)
POST /api/pdf/split          # file + ranges?
POST /api/pdf/compress       # file
POST /api/pdf/watermark      # file + text + opacity + angle
POST /api/pdf/rotate         # file + degrees
POST /api/pdf/protect        # file + password
POST /api/pdf/ocr            # file + lang [PRO]
POST /api/pdf/ai-summarize   # file [PRO]
POST /api/pdf/ai-qa          # file + question [PRO]
GET  /api/pdf/history        # ?page=1

GET  /api/admin/stats        [ADMIN]
GET  /api/admin/users        [ADMIN]
PATCH /api/admin/users/:id/ban [ADMIN]
GET  /api/admin/jobs         [ADMIN]

POST /api/user/create-checkout
PATCH /api/user/profile
DELETE /api/user/account

POST /api/webhook/stripe     (raw body, Stripe signature verified)
```

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm test

# Test PDF merge endpoint with curl:
curl -X POST http://localhost:5000/api/pdf/merge \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@file1.pdf" \
  -F "files=@file2.pdf"

# Expected response:
# { "success": true, "downloadUrl": "...", "pageCount": 10 }
```

---

*Built with ❤️ by the PDFUniverse team. For questions: support@pdfuniverse.app*
