# Ask Docsy - Government Services Assistant

Ask Docsy is a beautiful, interactive web interface for querying government documents and services. It features an animated mascot, real-time search capabilities, and AI-powered responses.

## Features

- 🤖 Animated Docsy mascot with idle and thinking animations
- 💬 Real-time chat interface
- 🔍 Advanced filtering by program, agency, and date
- 🎨 Beautiful, responsive design with Tailwind CSS
- ⚡ Powered by Next.js and React
- 🧠 AI responses using Google's Gemini 2.5 Pro
- 📊 MCP server integration for document search

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables:
```bash
cp .env.local.example .env.local
```

3. Fill in your API keys in `.env.local`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI**: Google Gemini 2.5 Pro
- **Backend**: MCP Server (Model Context Protocol)
- **Database**: Supabase (optional)

## Project Structure

```
ask-docsy/
├── src/
│   ├── components/
│   │   ├── DocsyChat.tsx      # Main chat component
│   │   └── DocsyAvatar.tsx    # Animated mascot
│   ├── lib/
│   │   ├── mcp-client.ts      # MCP server client
│   │   └── gemini-client.ts   # Gemini API client
│   ├── pages/
│   │   ├── index.tsx          # Home page
│   │   ├── _app.tsx           # App wrapper
│   │   └── _document.tsx      # Document wrapper
│   └── styles/
│       └── globals.css        # Global styles
├── public/
│   └── docsy.svg             # Docsy mascot
└── package.json
```

## Mobile Responsiveness

The interface is fully responsive and works beautifully on:
- Desktop computers
- Tablets
- Mobile phones

## Contributing

Feel free to submit issues and enhancement requests!