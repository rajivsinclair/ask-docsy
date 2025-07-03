import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
    const { query, limit = 10 } = req.body

    if (!query) {
      sendEvent('error', { error: 'Query is required' })
      res.end()
      return
    }

    console.log('Search API called with query:', query)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    // Send search started event
    sendEvent('search-started', { query, timestamp: new Date().toISOString() })

    // Step 1: Search in meetings table (which contains the denormalized data)
    sendEvent('step', { step: 'Searching meeting notes...', progress: 10 })
    
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .or(`document_notes_content.ilike.%${query}%,submission_notes.ilike.%${query}%,meeting_or_assignment_name.ilike.%${query}%`)
      .limit(limit)

    if (meetingsError) {
      console.error('Meetings search error:', meetingsError)
      sendEvent('error', { error: 'Failed to search meetings', details: meetingsError.message })
      res.end()
      return
    }

    sendEvent('step', { step: `Found ${meetings?.length || 0} relevant meetings`, progress: 30 })

    // Since meetings table contains all the data we need, we'll skip the documents search
    sendEvent('step', { step: 'Processing results...', progress: 60 })

    // Step 3: Format results
    sendEvent('step', { step: 'Formatting results...', progress: 70 })

    sendEvent('step', { step: 'Processing and ranking results...', progress: 85 })

    // Transform meeting results
    const results: any[] = []
    
    meetings?.forEach((meeting: any, index: number) => {
      // Get the main content
      const content = meeting.submission_notes || meeting.document_notes_content || ''
      
      results.push({
        id: meeting.id,
        text: content,
        score: 0.9 - (index * 0.05), // Higher scores for earlier results
        metadata: {
          program: meeting.program || 'Unknown',
          agency: meeting.agency || 'Unknown',
          assignment_name: meeting.meeting_or_assignment_name || 'Unknown Meeting',
          meeting_date: meeting.effective_meeting_date || new Date().toISOString(),
          document_type: meeting.submission_notes ? 'Meeting Notes' : 'Document',
          google_doc_url: meeting.google_doc_url,
          has_analysis: meeting.has_analysis
        },
        search_type: 'keyword',
        source: 'meetings'
      })
    })

    // Sort by score
    results.sort((a, b) => b.score - a.score)

    sendEvent('step', { step: 'Search complete!', progress: 100 })
    sendEvent('results', results.slice(0, limit))
    sendEvent('complete', { timestamp: new Date().toISOString() })
    
    res.end()
  } catch (error) {
    console.error('API error:', error)
    sendEvent('error', { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' })
    res.end()
  }
}