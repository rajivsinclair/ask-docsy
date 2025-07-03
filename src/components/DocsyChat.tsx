import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DocsyAvatar from './DocsyAvatar';
import { MCPClient } from '@/lib/mcp-client';
import { GeminiClient } from '@/lib/gemini-client';

interface Message {
  id: string;
  type: 'user' | 'docsy';
  content: string;
  timestamp: Date;
}

interface Filter {
  program?: string;
  agency?: string;
  dateRange?: { start: Date; end: Date };
}

export default function DocsyChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'docsy',
      content: "Hi! I'm Docsy, your friendly government services assistant. Ask me anything about government programs, benefits, or services!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [filters, setFilters] = useState<Filter>({});
  const [programs, setPrograms] = useState<string[]>([]);
  const [agencies, setAgencies] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const mcpClient = new MCPClient();
  const geminiClient = new GeminiClient();

  useEffect(() => {
    // Load programs and agencies for filters
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [programsData, agenciesData] = await Promise.all([
        mcpClient.getPrograms(),
        mcpClient.getAgencies(),
      ]);
      setPrograms(programsData);
      setAgencies(agenciesData);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // Search documents using MCP
      const searchResults = await mcpClient.searchDocuments(input, filters);
      
      // Generate response using Gemini
      const response = await geminiClient.generateResponse(input, searchResults);
      
      const docsyMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'docsy',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, docsyMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'docsy',
        content: "I'm sorry, I encountered an error while searching for that information. Please try again!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <DocsyAvatar isThinking={isThinking} isIdle={!isThinking} className="w-16 h-16" />
          <h1 className="text-3xl font-bold text-gray-800">Ask Docsy</h1>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          Filters {showFilters ? '▲' : '▼'}
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white rounded-lg shadow-md p-4 mb-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                <select
                  value={filters.program || ''}
                  onChange={(e) => setFilters({ ...filters, program: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Programs</option>
                  {programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
                <select
                  value={filters.agency || ''}
                  onChange={(e) => setFilters({ ...filters, agency: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Agencies</option>
                  {agencies.map(agency => (
                    <option key={agency} value={agency}>{agency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setFilters({
                      ...filters,
                      dateRange: date ? { start: date, end: new Date() } : undefined
                    });
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {message.type === 'docsy' && (
                  <DocsyAvatar className="w-10 h-10 mb-2" isThinking={false} isIdle={false} />
                )}
                <div
                  className={`rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.type === 'docsy' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-2">
                <DocsyAvatar className="w-10 h-10" isThinking={true} isIdle={false} />
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex space-x-1">
                    <span className="thinking-bubble"></span>
                    <span className="thinking-bubble"></span>
                    <span className="thinking-bubble"></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about government services..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isThinking}
        />
        <button
          type="submit"
          disabled={isThinking || !input.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}