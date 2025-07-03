# Ask Docsy - Local Government Meeting Search

A brutalist-styled AI search interface for exploring local government meeting notes from the Documenters Network.

## Features

✅ **Real-time Streaming Search**
- Server-Sent Events (SSE) for live progress updates
- Behind-the-scenes workflow visualization
- Streaming AI responses with chunk-by-chunk display

✅ **Interactive Brutalist Design**
- Yellow and black color scheme with hard shadows
- Interactive Docsy mascot with cursor tracking
- Rotating example queries
- Responsive animations

✅ **Complete RAG Implementation**
- Searches across submissions and documents tables
- Enriches results with program/city data
- Hybrid keyword search (semantic embeddings coming soon)
- Powered by Gemini 2.0 Flash

## Deployment

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`

## Local Development

```bash
npm install
npm run dev
```

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom brutalist utilities
- **Animations**: Framer Motion
- **Backend**: Next.js API routes with streaming
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash