# Ask Docsy Deployment Guide

## Quick Deployment to Vercel

### 1. Create a GitHub Repository (if not already done)
```bash
git remote add origin https://github.com/YOUR_USERNAME/ask-docsy.git
git push -u origin master
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://iwhnrwtqzkuuenghkrvq.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aG5yd3Rxemt1dWVuZ2hrcnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MzQ1NjAsImV4cCI6MjA1MTMxMDU2MH0.OGQcKuD1wz1P1GlKdMvUm8ycgq_O2mF0VpnMQwBNq8o`
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aG5yd3Rxemt1dWVuZ2hrcnZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTczNDU2MCwiZXhwIjoyMDUxMzEwNTYwfQ.1-qm69LO-KMVJFjy2h8f9Iog_IM_1_NqNGYZhGPhkjU`
   - `GEMINI_API_KEY`: `AIzaSyDyOMhzb6AzFDWLCxjdQNQIoRqOg2t_2AE`

5. Click "Deploy"

## Security Features
- ✅ Gemini API key is server-side only
- ✅ Uses Supabase service role key for secure database access
- ✅ No API keys exposed to frontend
- ✅ All external API calls go through secure Next.js API routes

## Local Development
```bash
npm install
npm run dev
```

## Build Test
```bash
npm run build
```

## Features
- 🔍 Hybrid search (semantic + keyword)
- 🎯 Advanced filtering by city, agency, date
- 🤖 AI responses powered by Gemini 2.5 Flash
- 📱 Responsive design
- ⚡ Fast search results
- 🎨 Animated Docsy mascot