AI Restaurant Recommendation Service
A full-stack restaurant recommendation web app that uses real Zomato data and Groq LLM to deliver personalized dining suggestions for Bangalore.
Live Demo: https://zomato-restaurant-recommendation-frontend-hb2459sfg.vercel.app/

What it does
Takes user preferences like city, cuisine type, budget, and minimum rating, queries a database of 51,717 real Zomato restaurants, and uses the Groq LLM to return the top 5 recommendations with AI-generated reasoning and real must-try dishes sourced from customer reviews.

Architecture
[ User Browser ]
      │
      ▼
[ Next.js Frontend ] ──── Vercel
      │
      │ POST /api/recommendations
      ▼
[ Node.js Backend ] ──── Render
      │
      ├──► [ Neon PostgreSQL ] ── 51,717 restaurants
      │
      └──► [ Groq LLM ] ── llama-3.3-70b-versatile
                │
                ▼
        AI Reasoning + Must-Try Dishes

Tech Stack
Frontend: Next.js 14, React, Tailwind CSS
Backend: Node.js, Express, TypeScript
Database: Neon PostgreSQL
LLM: Groq API with llama-3.3-70b-versatile
Dataset: HuggingFace Zomato Bangalore
Deployment: Vercel (frontend) and Render (backend)
CI/CD: GitHub Actions

Getting Started
Prerequisites
Node.js 20+
Neon PostgreSQL account
Groq API key

How It Works
1. User selects city, cuisine, budget, rating on frontend
2. Frontend sends POST /api/recommendations to backend
3. Backend validates request with Zod
4. Backend queries Neon DB for top 20 candidate restaurants
5. Candidates + preferences sent to Groq LLM
6. Groq analyzes and picks best 5 with reasoning
7. Must-try dishes sourced from real customer reviews
8. Results returned to frontend and displayed as cards

Disclaimer
Restaurant data is from Zomato collected around 2019-2020. Some restaurants may have closed or changed since then. Always verify before visiting.

Dataset
Source: https://huggingface.co/datasets/ManikaSaini/zomato-restaurant-recommendation
Size: 51,717 restaurants
Coverage: Bangalore, India



https://github.com/user-attachments/assets/bd506f77-b9b0-4da1-8246-55a33001edb8

