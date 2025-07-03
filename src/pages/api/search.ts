import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, filters = {}, limit = 10 } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    // Call the Supabase Edge Function for search
    const { data, error } = await supabase.functions.invoke('mcp-search', {
      body: {
        query,
        filters,
        limit
      }
    })

    if (error) {
      console.error('Search error:', error)
      return res.status(500).json({ error: 'Search failed' })
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}