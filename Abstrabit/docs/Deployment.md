# Production Deployment & Hosting Guide

## Option A: Single Container / VM Deployment (Docker Compose)

### 1. Build and Launch Containers
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 2. Verify Services
- **Frontend**: Accessible at `http://<your-server-ip>:80`
- **Backend API**: Accessible at `http://<your-server-ip>:5000/health/live`

---

## Option B: Cloud Platform Deployment

### Backend (Render / Railway / Fly.io / AWS ECS)
1. Deploy `Abstrabit/backend` as a Node.js Docker Web Service.
2. Provision a PostgreSQL instance with `pgvector` extension enabled (e.g. Neon PostgreSQL, Supabase, or AWS RDS PostgreSQL).
3. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=postgres://user:password@host:5432/abstrabit?sslmode=require`
   - `GEMINI_API_KEY=<your-google-gemini-key>`
   - `JWT_SECRET=<64-char-random-secret>`
   - `JWT_REFRESH_SECRET=<64-char-random-secret>`

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Connect `Abstrabit/frontend` repository.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable: `VITE_API_URL=https://api.yourdomain.com`
