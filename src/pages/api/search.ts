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

    // Simple keyword search in assignments_submission table
    let searchQuery = supabase
      .from('assignments_submission')
      .select(`
        *,
        role:assignments_role!inner(
          *,
          assignment:assignments_assignment!inner(
            *,
            meeting:meetings_meeting!inner(
              *,
              agency:meetings_agency!inner(
                name,
                program:programs_program!inner(name)
              )
            )
          )
        )
      `)
      .ilike('notes', `%${query}%`)
      .eq('complete', true)
      .limit(limit)

    const { data, error } = await searchQuery

    if (error) {
      console.error('Search error:', error)
      return res.status(500).json({ error: 'Search failed' })
    }

    // Transform data to match expected format
    const results = data?.map((submission: any, index: number) => ({
      id: `${submission.id}-${index}`,
      text: submission.notes || '',
      score: 0.8, // Mock score
      metadata: {
        program: submission.role?.assignment?.meeting?.agency?.program?.name || 'Unknown',
        agency: submission.role?.assignment?.meeting?.agency?.name || 'Unknown',
        assignment_name: submission.role?.assignment?.name || 'Unknown',
        meeting_date: submission.role?.assignment?.meeting?.date || new Date().toISOString(),
        document_type: 'Meeting Notes'
      },
      search_type: 'keyword'
    })) || []

    res.status(200).json(results)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}