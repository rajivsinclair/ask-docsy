import { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, searchResults } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Create context from search results
    const context = searchResults?.map((result: any) => 
      `Source: ${result.metadata.agency} - ${result.metadata.assignment_name} (${result.metadata.meeting_date})
Content: ${result.text}`
    ).join('\n\n') || ''

    const prompt = `You are Docsy, an AI assistant that helps people understand local government meetings and civic information. You have access to a comprehensive database of meeting notes from various city councils, planning commissions, and other government agencies across multiple US cities.

Based on the following search results from meeting documents, please provide a helpful, accurate, and well-structured response to the user's question.

User Question: ${query}

Search Results Context:
${context}

Please provide a response that:
1. Directly answers the user's question
2. Cites specific meetings, dates, and agencies when relevant
3. Is conversational and accessible to the general public
4. Highlights key decisions, votes, or outcomes when applicable
5. If the search results don't contain enough information, acknowledge that limitation

Response:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    res.status(200).json({ response: text })
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ error: 'Failed to generate response' })
  }
}