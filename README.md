# Ask Docsy

A beautiful, AI-powered web interface for searching across all Documenters Network meeting data. Ask Docsy lets anyone explore local government discussions from 19+ cities using natural language queries.

## Features

- **🤖 AI-Powered Search**: Uses Gemini 2.5 Pro for intelligent responses
- **🔍 Hybrid Search**: Combines semantic and keyword search
- **🎨 Beautiful Interface**: Animated Docsy mascot and responsive design
- **🏛️ Civic Focus**: Specialized for local government and civic data
- **📱 Mobile-Friendly**: Works on all devices

## Live Demo

Visit [Ask Docsy](https://ask-docsy.vercel.app) to try it out!

## Screenshots

[Add screenshots here showing the interface, Docsy avatar, and search results]

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **AI**: Gemini 2.5 Pro for responses, Gemini Embedding-001 for search
- **Backend**: Supabase Edge Functions
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn or npm
- Supabase project (for backend)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/ask-docsy.git
cd ask-docsy
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://gvluxfxoxiauztcpkznh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Examples

Ask Docsy can answer questions like:

- **Policy Questions**: "What housing policies are being discussed in Chicago?"
- **Cross-City Comparisons**: "Compare climate change initiatives across different cities"
- **Timeline Queries**: "Show me recent police reform discussions"
- **Specific Decisions**: "What did Detroit City Council decide about budget cuts?"
- **Public Participation**: "What are residents saying about the new development?"

## Features in Detail

### Animated Docsy Avatar

The Docsy mascot provides visual feedback:
- **Idle state**: Gentle pulse and ready indicator
- **Thinking state**: Animation with thought bubbles and sparkles
- **Status indicators**: Green (ready) and amber (processing)

### Advanced Search Filters

- **Cities/Programs**: Filter by specific Documenters programs
- **Agencies**: Focus on particular government bodies
- **Date Range**: Search within specific time periods
- **Search Method**: Choose between semantic, keyword, or hybrid search

### Smart Response Generation

Responses include:
- **Direct answers** to user questions
- **Source citations** with meeting details
- **Context** about broader trends
- **Related discussions** from other cities

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js Web   │    │  Supabase Edge   │    │   Documenters   │
│   Application   │───▶│   Functions      │───▶│   Database      │
│   (Vercel)      │    │  (Search/AI)     │    │  (Embeddings)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow

1. **User Query**: Natural language input from web interface
2. **Search Processing**: Supabase Edge Function performs hybrid search
3. **AI Response**: Gemini 2.5 Pro generates contextual answer
4. **Results Display**: Formatted response with source citations

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://gvluxfxoxiauztcpkznh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Custom Domain

Add your custom domain in Vercel settings for a branded experience.

## Development

### Project Structure

```
ask-docsy/
├── src/
│   ├── components/          # React components
│   │   ├── DocsyAvatar.tsx  # Animated mascot
│   │   ├── DocsyChat.tsx    # Main chat interface
│   │   ├── SearchFilters.tsx # Search filters
│   │   └── ResultCard.tsx   # Search result display
│   ├── lib/                 # Utility functions
│   │   └── mcp-client.ts    # API client
│   └── pages/               # Next.js pages
│       └── index.tsx        # Home page
├── public/                  # Static assets
├── package.json
└── README.md
```

### Key Components

#### DocsyAvatar
Animated mascot that responds to application state:
- Smooth transitions between idle and thinking states
- Particle effects and status indicators
- Built with Framer Motion

#### DocsyChat
Main chat interface with:
- Message history management
- Real-time typing indicators
- Example query suggestions
- Filter integration

#### SearchFilters
Advanced filtering options:
- Program/city selection
- Agency filtering
- Date range pickers
- Search method selection

### Styling

Uses Tailwind CSS with custom design system:
- **Colors**: Purple/blue gradient theme
- **Typography**: Clean, readable fonts
- **Components**: Consistent spacing and shadows
- **Animations**: Smooth, purposeful motion

### API Integration

The app communicates with Supabase Edge Functions:
- **mcp-search**: Hybrid search functionality
- **generate-embeddings**: Embedding generation (admin)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

### Development Guidelines

- Follow React best practices
- Use TypeScript for all new code
- Add proper error handling
- Test on multiple devices
- Maintain accessibility standards

## Performance

### Optimization Features

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Edge Caching**: Vercel Edge Network
- **API Caching**: Response caching for common queries

### Monitoring

Monitor performance using:
- Vercel Analytics
- Core Web Vitals
- Error tracking with Sentry (optional)

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: WCAG AA compliant
- **Focus Management**: Clear focus indicators

## Security

- **Environment Variables**: Secure API key storage
- **Input Validation**: Query sanitization
- **Rate Limiting**: Via Supabase Edge Functions
- **CSP Headers**: Content Security Policy

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- **City Bureau**: For creating the Documenters Network
- **Documenters**: For their civic engagement and data collection
- **Supabase**: For the backend infrastructure
- **Vercel**: For hosting and deployment
- **Google**: For Gemini AI models

## Support

For questions or issues:
- Open a GitHub issue
- Contact the development team
- Check the [Documenters Network](https://www.documenters.org) for more information

---

Built with ❤️ for civic engagement and government transparency.