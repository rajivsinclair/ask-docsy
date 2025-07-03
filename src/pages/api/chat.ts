import { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Enable streaming
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  try {
    const { query, searchResults } = req.body

    if (!query) {
      sendEvent('error', { error: 'Query is required' })
      res.end()
      return
    }

    sendEvent('ai-started', { timestamp: new Date().toISOString() })
    sendEvent('step', { step: 'Analyzing search results...', progress: 10 })

    // Create context from search results
    const context = searchResults?.map((result: any) => 
      `Source: ${result.metadata?.agency || 'Unknown'} - ${result.metadata?.assignment_name || 'Unknown Meeting'} (${result.metadata?.meeting_date || 'Unknown Date'})
Program: ${result.metadata?.program || 'Unknown'}
Content: ${result.text?.substring(0, 500) || 'No content'}...`
    ).join('\n\n---\n\n') || ''

    sendEvent('step', { step: 'Preparing context from meeting notes...', progress: 20 })

    const prompt = `You are Docsy, a friendly and knowledgeable AI assistant that helps people understand local government meetings. You have access to meeting notes from various city councils, planning commissions, and other government agencies across multiple US cities.

Based on the following search results from meeting documents, provide a helpful, accurate, and conversational response to the user's question.

User Question: ${query}

Meeting Documents Found:
${context}

Instructions:
1. Be conversational and friendly - you're Docsy!
2. Directly answer the user's question based on the meeting notes
3. Cite specific meetings and dates when relevant
4. Use simple language that's accessible to everyone
5. Highlight key decisions, votes, or outcomes when applicable
6. If the search results don't contain enough information, acknowledge that
7. Keep your response concise but informative

Response:`

    sendEvent('step', { step: 'Generating AI response...', progress: 40 })

    let fullResponse = ''
    let modelUsed = ''

    // Try Gemini first
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
        const result = await model.generateContentStream(prompt)
        
        let chunkCount = 0
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text()
          fullResponse += chunkText
          chunkCount++
          
          // Send chunk event
          sendEvent('chunk', { 
            text: chunkText, 
            chunkNumber: chunkCount,
            progress: Math.min(40 + (chunkCount * 2), 90) 
          })
        }
        
        modelUsed = 'gemini-2.0-flash-exp'
      } catch (geminiError) {
        console.log('Gemini failed, falling back to OpenAI:', geminiError)
        sendEvent('step', { step: 'Switching to OpenAI GPT-4.1...', progress: 50 })
        
        // Fall back to OpenAI
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4.1',
            messages: [{ role: 'user', content: prompt }],
            stream: true
          })
        })

        if (!openAIResponse.ok) {
          throw new Error(`OpenAI API error: ${openAIResponse.statusText}`)
        }

        const reader = openAIResponse.body?.getReader()
        const decoder = new TextDecoder()
        let chunkCount = 0

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.substring(6))
                  const content = data.choices?.[0]?.delta?.content
                  
                  if (content) {
                    fullResponse += content
                    chunkCount++
                    
                    sendEvent('chunk', { 
                      text: content, 
                      chunkNumber: chunkCount,
                      progress: Math.min(50 + (chunkCount * 2), 90) 
                    })
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }
        
        modelUsed = 'gpt-4.1'
      }
    } else if (process.env.OPENAI_API_KEY) {
      // No Gemini key, use OpenAI directly
      sendEvent('step', { step: 'Using OpenAI GPT-4.1...', progress: 45 })
      
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [{ role: 'user', content: prompt }],
          stream: true
        })
      })

      if (!openAIResponse.ok) {
        throw new Error(`OpenAI API error: ${openAIResponse.statusText}`)
      }

      const reader = openAIResponse.body?.getReader()
      const decoder = new TextDecoder()
      let chunkCount = 0

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.substring(6))
                const content = data.choices?.[0]?.delta?.content
                
                if (content) {
                  fullResponse += content
                  chunkCount++
                  
                  sendEvent('chunk', { 
                    text: content, 
                    chunkNumber: chunkCount,
                    progress: Math.min(40 + (chunkCount * 2), 90) 
                  })
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
      
      modelUsed = 'gpt-4.1'
    } else {
      // No AI API keys available - provide a helpful response with search results
      sendEvent('step', { step: 'Formatting search results...', progress: 50 })
      
      if (searchResults && searchResults.length > 0) {
        fullResponse = `Hi! I found ${searchResults.length} relevant meeting${searchResults.length > 1 ? 's' : ''} about "${query}":\n\n`
        
        searchResults.slice(0, 3).forEach((result: any, index: number) => {
          fullResponse += `**${index + 1}. ${result.metadata?.assignment_name || 'Meeting'}**\n`
          fullResponse += `Agency: ${result.metadata?.agency || 'Unknown'}\n`
          fullResponse += `Date: ${result.metadata?.meeting_date ? new Date(result.metadata.meeting_date).toLocaleDateString() : 'Unknown'}\n`
          fullResponse += `Summary: ${result.text?.substring(0, 200) || 'No summary available'}...\n\n`
        })
        
        fullResponse += `\nNote: AI analysis is currently unavailable. Please configure either GEMINI_API_KEY or OPENAI_API_KEY environment variables for enhanced AI responses.`
      } else {
        fullResponse = `I searched for "${query}" but didn't find any relevant meetings in our database. This could mean:\n\n• No meetings have discussed this topic recently\n• The topic might be handled by a different agency\n• The search terms might need to be adjusted\n\nTry searching for broader terms or related topics.`
      }
      
      // Simulate streaming for consistent UX
      for (let i = 0; i < fullResponse.length; i += 50) {
        const chunk = fullResponse.substring(i, i + 50)
        sendEvent('chunk', { 
          text: chunk, 
          chunkNumber: Math.floor(i / 50) + 1,
          progress: Math.min(50 + (i / fullResponse.length) * 40, 90) 
        })
      }
      
      modelUsed = 'search-only-mode'
    }

    sendEvent('step', { step: 'Response complete!', progress: 100 })
    sendEvent('complete', { 
      fullResponse,
      timestamp: new Date().toISOString(),
      model: modelUsed,
      tokenCount: fullResponse.length // Approximate
    })

    res.end()
  } catch (error) {
    console.error('Chat API error:', error)
    sendEvent('error', { 
      error: 'Failed to generate response', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
    res.end()
  }
}