# Deployment Guide

This guide covers deploying the AI Restaurant Recommendation Service to **Render** (backend) and **Vercel** (frontend).

---

## Prerequisites

- GitHub repository with the latest code pushed to `main`
- Neon PostgreSQL database provisioned and seeded
- Groq API key from [console.groq.com](https://console.groq.com)

---

## Backend — Render Deployment

### Step 1: Create a New Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure the service:

| Setting          | Value                            |
|------------------|----------------------------------|
| **Name**         | `zomato-ai-backend`              |
| **Root Directory** | `apps/backend`                 |
| **Environment**  | `Node`                           |
| **Build Command** | `npm install && npm run build`  |
| **Start Command** | `node dist/index.js`            |
| **Plan**         | Free                             |

### Step 2: Set Environment Variables

Add these in the Render dashboard under **Environment**:

| Variable           | Value                                     |
|--------------------|-------------------------------------------|
| `PORT`             | `3001`                                    |
| `NODE_ENV`         | `production`                              |
| `DATABASE_URL`     | `<your Neon PostgreSQL connection string>` |
| `GROQ_API_KEY`     | `<your Groq API key>`                     |
| `FRONTEND_URL`     | `<your Vercel frontend URL>`              |

### Step 3: Configure Health Check

| Setting             | Value     |
|---------------------|-----------|
| **Health Check Path** | `/health` |

The `/health` endpoint returns `200 OK` when the backend and database are operational.
Render will use this to monitor service health and trigger restarts if needed.

### Step 4: Deploy

Click **Create Web Service**. Render will:
1. Clone the repository
2. Run `npm install && npm run build`
3. Start `node dist/index.js`
4. Verify the health check at `/health`

> **Note:** After the first deploy, copy the Render URL (e.g., `https://zomato-ai-backend.onrender.com`) 
> and add it as `NEXT_PUBLIC_API_URL` in Vercel.

---

## Frontend — Vercel Deployment

### Step 1: Import Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import your GitHub repository
4. Configure the project:

| Setting             | Value            |
|---------------------|------------------|
| **Framework Preset** | `Next.js`       |
| **Root Directory**   | `apps/frontend` |

### Step 2: Set Environment Variables

Add this in the Vercel dashboard under **Settings → Environment Variables**:

| Variable               | Value                                          |
|------------------------|------------------------------------------------|
| `NEXT_PUBLIC_API_URL`  | `https://zomato-ai-backend.onrender.com`       |

> Replace with your actual Render backend URL.

### Step 3: Deploy

Click **Deploy**. Vercel will:
1. Install dependencies
2. Build the Next.js application
3. Deploy to the Vercel edge network

### Step 4: Update Backend CORS

After Vercel assigns your domain (e.g., `https://zomato-ai.vercel.app`):
1. Go to your Render dashboard
2. Update the `FRONTEND_URL` environment variable to your Vercel URL
3. Render will auto-redeploy with the updated CORS configuration

---

## Environment Variables Summary

### Render (Backend)

| Variable         | Required | Description                               |
|------------------|----------|-------------------------------------------|
| `PORT`           | Yes      | Server port (use `3001`)                  |
| `NODE_ENV`       | Yes      | Set to `production`                       |
| `DATABASE_URL`   | Yes      | Neon PostgreSQL connection string         |
| `GROQ_API_KEY`   | Yes      | Groq LLM API key                         |
| `FRONTEND_URL`   | Yes      | Vercel frontend URL (for CORS)            |

### Vercel (Frontend)

| Variable               | Required | Description                        |
|------------------------|----------|------------------------------------|
| `NEXT_PUBLIC_API_URL`  | Yes      | Render backend URL                 |

---

## Post-Deployment Verification

1. **Health Check:**  
   ```bash
   curl https://your-backend.onrender.com/health
   ```

2. **API Test:**  
   ```bash
   curl -X POST https://your-backend.onrender.com/api/recommendations \
     -H "Content-Type: application/json" \
     -d '{"city": "BTM", "max_budget": 9999, "min_rating": 0}'
   ```

3. **Frontend:** Open your Vercel URL and submit a search.

---

## Troubleshooting

| Issue                        | Solution                                              |
|------------------------------|-------------------------------------------------------|
| CORS errors in browser       | Verify `FRONTEND_URL` on Render matches Vercel domain |
| 503 on health check          | Check `DATABASE_URL` is correct on Render             |
| Empty recommendations        | Ensure database is seeded (`npx tsx src/scripts/seed.ts`) |
| Rate limit hit               | Wait 15 minutes or adjust `rateLimiter.ts` limits     |
| Render free tier cold starts | First request may take 30-60s after inactivity        |
