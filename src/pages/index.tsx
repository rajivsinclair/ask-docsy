import { useState, useEffect } from 'react'
import Head from 'next/head'
import { DocsyChat } from '../components/DocsyChat'
import { motion } from 'framer-motion'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Head>
        <title>Ask Docsy - Documenters Network AI Search</title>
        <meta name="description" content="AI-powered search across all Documenters network meeting data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Ask <span className="text-purple-600">Docsy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search across thousands of local government meetings from the{' '}
            <span className="font-semibold text-blue-600">Documenters Network</span>.
            Get AI-powered insights from civic data across 19+ cities.
          </p>
        </motion.div>

        {/* Network Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2,300+</div>
            <div className="text-gray-600">Public Meetings Covered</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">19</div>
            <div className="text-gray-600">Cities in Network</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">4,000+</div>
            <div className="text-gray-600">Trained Documenters</div>
          </div>
        </motion.div>

        {/* Chat Interface */}
        <DocsyChat />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center text-gray-500"
        >
          <p className="mb-4">
            Powered by the{' '}
            <a 
              href="https://www.documenters.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Documenters Network
            </a>
            {' '}and{' '}
            <a 
              href="https://www.citybureau.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              City Bureau
            </a>
          </p>
          <p className="text-sm">
            Making local government accountable & transparent through participatory civic media
          </p>
        </motion.footer>
      </main>
    </div>
  )
}