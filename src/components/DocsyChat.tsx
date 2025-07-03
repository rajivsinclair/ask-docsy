import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Filter, Calendar, MapPin, Loader2 } from 'lucide-react'
import { DocsyAvatar } from './DocsyAvatar'
import { SearchFilters } from './SearchFilters'
import { ResultCard } from './ResultCard'
// Remove import of mcp-client since we'll use API routes

interface SearchResult {
  id: string
  text: string
  score: number
  metadata: {
    program: string
    agency: string
    assignment_name: string
    meeting_date: string
    document_type: string
  }
  search_type: string
  context?: any
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  results?: SearchResult[]
  timestamp: Date
}

export function DocsyChat() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    programs: [] as string[],
    agencies: [] as string[],
    date_from: '',
    date_to: '',
    search_method: 'hybrid' as 'semantic' | 'keyword' | 'hybrid'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isThinking) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsThinking(true)
    setQuery('')

    try {
      // 1. Search using secure API route
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters, limit: 10 })
      })
      
      if (!searchResponse.ok) {
        throw new Error('Search failed')
      }
      
      const searchResults = await searchResponse.json()
      
      // 2. Generate AI response using secure API route
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, searchResults })
      })
      
      if (!chatResponse.ok) {
        throw new Error('Failed to generate response')
      }
      
      const { response: aiResponse } = await chatResponse.json()
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        results: searchResults,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Search error:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I'm sorry, I encountered an error while searching: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsThinking(false)
    }
  }

  const exampleQueries = [
    "What housing policies are being discussed in Chicago?",
    "Show me recent police reform discussions across cities",
    "What did the Detroit City Council decide about budget cuts?",
    "Compare climate change initiatives in different cities"
  ]

  const handleExampleClick = (example: string) => {
    setQuery(example)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Docsy Avatar */}
      <div className="flex justify-center mb-8">
        <DocsyAvatar isThinking={isThinking} />
      </div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-8"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Docsy about local government meetings..."
              className="w-full px-6 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isThinking}
            />
            <div className="absolute right-2 top-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
              >
                <Filter size={20} />
              </button>
              <button
                type="submit"
                disabled={isThinking || !query.trim()}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isThinking ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <SearchFilters filters={filters} onChange={setFilters} />
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Example Queries */}
        {messages.length === 0 && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">Try asking about:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-3 text-sm bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Thinking Indicator */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-gray-600">Docsy is searching through thousands of meetings...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`${
                message.type === 'user' 
                  ? 'ml-auto max-w-2xl' 
                  : 'mr-auto max-w-full'
              }`}
            >
              {message.type === 'user' ? (
                <div className="bg-purple-600 text-white p-4 rounded-2xl rounded-br-sm">
                  <p>{message.content}</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  {/* AI Response */}
                  <div className="prose prose-sm max-w-none mb-6">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>

                  {/* Search Results */}
                  {message.results && message.results.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Calendar size={20} className="mr-2" />
                        Meeting Records ({message.results.length})
                      </h4>
                      <div className="grid gap-4">
                        {message.results.slice(0, 5).map((result, index) => (
                          <ResultCard key={index} result={result} />
                        ))}
                      </div>
                      {message.results.length > 5 && (
                        <p className="text-sm text-gray-500 mt-4 text-center">
                          And {message.results.length - 5} more results...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}