import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { DocsyAvatar } from './DocsyAvatar'
import { ResultCard } from './ResultCard'

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
        body: JSON.stringify({ query, limit: 10 })
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
    "Tell me about housing policies",
    "Police reform discussions",
    "Budget decisions",
    "Climate initiatives"
  ]

  const handleExampleClick = (example: string) => {
    setQuery(example)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Docsy Avatar */}
      <div className="flex justify-center mb-12">
        <DocsyAvatar isThinking={isThinking} />
      </div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-yellow-100 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about local government meetings..."
              className="w-full px-6 py-4 text-lg border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              disabled={isThinking}
            />
            <div className="absolute right-2 top-2">
              <button
                type="submit"
                disabled={isThinking || !query.trim()}
                className="bg-yellow-400 hover:bg-yellow-500 border-2 border-black text-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isThinking ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </form>

        {/* Example Queries */}
        {messages.length === 0 && (
          <div className="mt-6">
            <p className="text-lg font-bold text-black mb-4">Try asking me:</p>
            <div className="grid grid-cols-2 gap-3">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-50 transition-all font-medium"
                >
                  {example}
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
            className="bg-yellow-200 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-6"
          >
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-black border border-black animate-bounce"></div>
                <div className="w-3 h-3 bg-black border border-black animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-black border border-black animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-black font-bold text-lg">Docsy is thinking...</span>
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
                <div className="bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black p-4 font-bold">
                  <p>{message.content}</p>
                </div>
              ) : (
                <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                  {/* AI Response */}
                  <div className="mb-6">
                    <div className="text-black font-medium leading-relaxed whitespace-pre-wrap">{message.content}</div>
                  </div>

                  {/* Search Results */}
                  {message.results && message.results.length > 0 && (
                    <div>
                      <h4 className="text-xl font-bold text-black mb-4 border-b-4 border-black pb-2">
                        Meeting Records ({message.results.length})
                      </h4>
                      <div className="grid gap-4">
                        {message.results.slice(0, 5).map((result, index) => (
                          <ResultCard key={index} result={result} />
                        ))}
                      </div>
                      {message.results.length > 5 && (
                        <p className="text-black font-bold mt-4 text-center">
                          And {message.results.length - 5} more results found!
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