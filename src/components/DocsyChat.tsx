import { useState, useEffect, useRef } from 'react'
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

interface WorkflowStep {
  step: string
  progress: number
  timestamp: string
}

export function DocsyChat() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [currentResponse, setCurrentResponse] = useState('')
  const [examples, setExamples] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const exampleQueries = [
    ["Housing affordability crisis", "Tenant rights protection"],
    ["Police accountability measures", "Community safety programs"],
    ["Budget allocation debates", "Infrastructure spending"],
    ["Climate action plans", "Environmental justice"],
    ["Zoning law changes", "Development proposals"],
    ["Public transit expansion", "Traffic calming measures"]
  ]

  // Rotate examples
  useEffect(() => {
    const interval = setInterval(() => {
      setExamples((prev) => (prev + 1) % exampleQueries.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

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
    setWorkflowSteps([])
    setCurrentResponse('')
    setSearchResults([]) // Clear previous results

    try {
      // 1. Search using streaming API
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 10 })
      })
      
      if (!searchResponse.ok) {
        throw new Error('Search failed')
      }
      
      // Read search stream and collect results
      const searchReader = searchResponse.body?.getReader()
      const searchDecoder = new TextDecoder()
      let searchBuffer = ''
      let finalSearchResults: SearchResult[] = []
      
      if (searchReader) {
        while (true) {
          const { done, value } = await searchReader.read()
          if (done) break
          
          searchBuffer += searchDecoder.decode(value, { stream: true })
          const lines = searchBuffer.split('\n')
          searchBuffer = lines.pop() || '' // Keep incomplete line in buffer
          
          let currentEvent = ''
          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.substring(6).trim()
              console.log('Event type:', currentEvent)
            } else if (line.startsWith('data:') && currentEvent) {
              try {
                const data = JSON.parse(line.substring(5))
                console.log('Event data for', currentEvent, ':', data)
                
                if (currentEvent === 'step') {
                  setWorkflowSteps(prev => [...prev, {
                    step: data.step,
                    progress: data.progress,
                    timestamp: new Date().toISOString()
                  }])
                } else if (currentEvent === 'results') {
                  finalSearchResults = data || []
                  setSearchResults(finalSearchResults)
                  console.log('CAPTURED search results:', finalSearchResults?.length || 0, 'items')
                  // Show real data found
                  if (finalSearchResults && finalSearchResults.length > 0) {
                    setWorkflowSteps(prev => [...prev, {
                      step: `📊 REAL DATA: Found ${finalSearchResults.length} meeting records`,
                      progress: 60,
                      timestamp: new Date().toISOString()
                    }])
                    // Show source agencies
                    const agencySet = new Set(finalSearchResults.slice(0, 3).map((r: any) => r.metadata?.agency).filter(Boolean))
                    const agencies = Array.from(agencySet)
                    if (agencies.length > 0) {
                      setWorkflowSteps(prev => [...prev, {
                        step: `🏛️ ACTUAL SOURCES: ${agencies.join(', ')}`,
                        progress: 70,
                        timestamp: new Date().toISOString()
                      }])
                    }
                  } else {
                    setWorkflowSteps(prev => [...prev, {
                      step: `❌ PROBLEM: Search returned 0 results`,
                      progress: 60,
                      timestamp: new Date().toISOString()
                    }])
                  }
                } else if (currentEvent === 'error') {
                  throw new Error(data.error || 'Search failed')
                }
                // Don't reset currentEvent here - let it persist until next event
              } catch (parseError) {
                console.error('Error parsing search data:', parseError, 'Line:', line)
              }
            }
          }
        }
      }
      
      // 2. Generate AI response using streaming
      console.log('Passing search results to chat API:', finalSearchResults?.length || 0, 'results')
      
      // Add debugging step to workflow
      setWorkflowSteps(prev => [...prev, {
        step: `🔄 Passing ${finalSearchResults?.length || 0} search results to AI`,
        progress: 95,
        timestamp: new Date().toISOString()
      }])
      
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, searchResults: finalSearchResults })
      })
      
      if (!chatResponse.ok) {
        throw new Error('Failed to generate response')
      }
      
      // Read chat stream
      const chatReader = chatResponse.body?.getReader()
      const chatDecoder = new TextDecoder()
      let fullResponse = ''
      let chatBuffer = ''
      
      if (chatReader) {
        while (true) {
          const { done, value } = await chatReader.read()
          if (done) break
          
          chatBuffer += chatDecoder.decode(value, { stream: true })
          const lines = chatBuffer.split('\n')
          chatBuffer = lines.pop() || '' // Keep incomplete line in buffer
          
          let currentEvent = ''
          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.substring(6).trim()
            } else if (line.startsWith('data:') && currentEvent) {
              try {
                const data = JSON.parse(line.substring(5))
                
                if (currentEvent === 'step') {
                  setWorkflowSteps(prev => [...prev, {
                    step: data.step,
                    progress: data.progress,
                    timestamp: new Date().toISOString()
                  }])
                } else if (currentEvent === 'chunk') {
                  fullResponse += data.text
                  setCurrentResponse(fullResponse)
                } else if (currentEvent === 'complete') {
                  // Add final workflow step with actual data sources
                  if (finalSearchResults && finalSearchResults.length > 0) {
                    setWorkflowSteps(prev => [...prev, {
                      step: `📋 Generated response using data from ${finalSearchResults.length} meetings`,
                      progress: 100,
                      timestamp: new Date().toISOString()
                    }])
                  }
                  
                  const assistantMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'assistant',
                    content: data.fullResponse || fullResponse,
                    results: finalSearchResults,
                    timestamp: new Date()
                  }
                  setMessages(prev => [...prev, assistantMessage])
                  setCurrentResponse('')
                } else if (currentEvent === 'error') {
                  throw new Error(data.error || 'AI response failed')
                }
                // Don't reset currentEvent here - let it persist until next event
              } catch (parseError) {
                console.error('Error parsing chat data:', parseError)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      
      let errorContent = "I'm sorry, I encountered an error while processing your request. "
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorContent += "The AI service is not properly configured. Please ensure the Gemini API key is set up correctly."
        } else if (error.message.includes('Search failed')) {
          errorContent += "The search service is temporarily unavailable. Please try again in a moment."
        } else {
          errorContent += `Error details: ${error.message}`
        }
      } else {
        errorContent += "An unexpected error occurred. Please try again."
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorContent,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      
      // Show error in workflow
      setWorkflowSteps(prev => [...prev, {
        step: '❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        progress: 0,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsThinking(false)
      // Keep workflow visible to show what data was used
    }
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Docsy Avatar with cursor interaction */}
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
              className="w-full px-6 py-4 pr-14 text-lg border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={isThinking || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-yellow-400 hover:bg-yellow-500 border-2 border-black text-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isThinking ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </form>

        {/* Example Queries - Rotating */}
        {messages.length === 0 && (
          <div className="mt-6">
            <p className="text-lg font-bold text-black mb-4">Try asking about:</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={examples}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 gap-3"
              >
                {exampleQueries[examples].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-left p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-50 transition-all font-medium"
                  >
                    {example}
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Workflow Visualization */}
      <AnimatePresence>
        {workflowSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black text-yellow-400 border-4 border-yellow-400 p-4 mb-6 font-mono text-sm overflow-hidden"
          >
            <div className="mb-3 font-bold text-yellow-300 flex items-center">
              <div className="mr-2">🔍</div>
              DOCSY AGENTIC SEARCH & RAG WORKFLOW
            </div>
            <div className="space-y-2">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1 flex items-center">
                      <span className="mr-2">
                        {step.progress === 100 ? '✓' : step.progress >= 40 ? '⚡' : '►'}
                      </span>
                      {step.step}
                    </span>
                    <div className="w-40 bg-gray-800 h-2 ml-4 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${step.progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <span className="ml-3 text-xs font-bold min-w-[3rem] text-right">{step.progress}%</span>
                  </div>
                  {/* Show data counts if available */}
                  {step.step.includes('Found') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-yellow-300 ml-7 mt-1"
                    >
                      {step.step}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            {/* Live data indicator */}
            <motion.div
              className="mt-3 text-xs text-yellow-300 flex items-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
              Processing real-time data from local government meetings...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking Indicator */}
      <AnimatePresence>
        {isThinking && currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-yellow-200 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-6"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-black border border-black animate-bounce"></div>
                <div className="w-3 h-3 bg-black border border-black animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-black border border-black animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-black font-bold text-lg">Docsy is typing...</span>
            </div>
            <div className="text-black font-medium whitespace-pre-wrap">{currentResponse}</div>
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