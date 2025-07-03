interface SearchFilters {
  programs?: string[]
  agencies?: string[]
  date_from?: string
  date_to?: string
  search_method?: 'semantic' | 'keyword' | 'hybrid'
}

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvluxfxoxiauztcpkznh.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyB5lnc9aQzazfkDETcyai2OoLnUci0SOGU'

export async function searchDocumenters(
  query: string,
  filters: SearchFilters
): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/mcp-search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        filters: {
          programs: filters.programs,
          agencies: filters.agencies,
          date_from: filters.date_from,
          date_to: filters.date_to,
          limit: 10
        },
        search_method: filters.search_method || 'hybrid'
      })
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Search failed')
    }

    return data.results || []
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

export async function generateResponse(
  query: string, 
  searchResults: SearchResult[]
): Promise<string> {
  try {
    // Prepare context from search results
    const context = searchResults.slice(0, 5).map(result => {
      const metadata = result.metadata
      return `
Meeting: ${metadata.assignment_name}
Agency: ${metadata.agency}
Program: ${metadata.program}
Date: ${metadata.meeting_date}
Content: ${result.text.slice(0, 800)}...
---`
    }).join('\n')

    const prompt = `You are Docsy, an AI assistant specialized in local government and civic data from the Documenters Network. You have access to meeting notes, discussions, and decisions from 19+ cities across the United States.

Your role is to help people understand what's happening in local government by providing clear, accurate, and insightful answers based on the meeting data available to you.

User Question: ${query}

Relevant Meeting Data:
${context}

Please provide a comprehensive, helpful response that:
1. Directly answers the user's question
2. Cites specific meetings, agencies, and dates when possible
3. Provides context about the broader trends or patterns you see
4. Is written in a friendly, accessible tone
5. Highlights key decisions, discussions, or public participation
6. If comparing across cities, points out similarities and differences

If the search results don't contain enough information to fully answer the question, acknowledge this and suggest how the user might refine their search.

Response:`

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API')
    }

    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error('Response generation error:', error)
    
    // Fallback response
    if (searchResults.length > 0) {
      return `I found ${searchResults.length} relevant meeting records related to "${query}". Based on the search results, I can see discussions from ${searchResults.map(r => r.metadata.program).filter((v, i, a) => a.indexOf(v) === i).join(', ')}. Please check the meeting records below for detailed information.`
    } else {
      return `I couldn't find specific meeting records related to "${query}". Try rephrasing your question or using different keywords. You can also filter by specific cities or agencies to narrow your search.`
    }
  }
}

export async function getAvailablePrograms(): Promise<string[]> {
  // This would typically fetch from the database
  // For now, return known programs from the Documenters network
  return [
    'Chicago',
    'Detroit', 
    'Atlanta',
    'Cleveland',
    'Newark',
    'Fresno',
    'Omaha',
    'Minneapolis',
    'Philadelphia',
    'Los Angeles',
    'Dallas',
    'Fort Worth',
    'Gary',
    'Grand Rapids',
    'Indianapolis',
    'Wichita',
    'Tulsa',
    'Spokane',
    'San Diego'
  ]
}

export async function getAvailableAgencies(): Promise<string[]> {
  // This would typically fetch from the database
  // For now, return common agency types
  return [
    'City Council',
    'Planning Commission',
    'Zoning Board',
    'School Board',
    'Housing Authority',
    'Transit Authority',
    'Police Commission',
    'Parks and Recreation',
    'Public Health Department',
    'Building Commission',
    'Budget Committee'
  ]
}