import { Calendar, MapPin, Building, TrendingUp } from 'lucide-react'

interface ResultCardProps {
  result: {
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
}

export function ResultCard({ result }: ResultCardProps) {
  const { metadata, score, text, search_type } = result

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getScoreColor = (score: number) => {
    if (score > 0.8) return 'text-green-600'
    if (score > 0.6) return 'text-yellow-600'
    return 'text-gray-500'
  }

  const getSearchTypeColor = (type: string) => {
    switch (type) {
      case 'semantic': return 'bg-purple-100 text-purple-800'
      case 'keyword': return 'bg-blue-100 text-blue-800'
      case 'hybrid': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">
            {metadata.assignment_name || 'Unknown Meeting'}
          </h4>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Building size={14} className="mr-1" />
              {metadata.agency}
            </span>
            <span className="flex items-center">
              <MapPin size={14} className="mr-1" />
              {metadata.program}
            </span>
            <span className="flex items-center">
              <Calendar size={14} className="mr-1" />
              {formatDate(metadata.meeting_date)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <span className={`flex items-center text-sm font-medium ${getScoreColor(score)}`}>
            <TrendingUp size={14} className="mr-1" />
            {(score * 100).toFixed(0)}%
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSearchTypeColor(search_type)}`}>
            {search_type}
          </span>
        </div>
      </div>

      {/* Content Preview */}
      <div className="text-sm text-gray-700 leading-relaxed">
        {text.length > 300 ? (
          <>
            {text.substring(0, 300)}
            <span className="text-gray-500">...</span>
          </>
        ) : (
          text
        )}
      </div>

      {/* Context Information */}
      {result.context?.surrounding_text && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Context:</p>
          <p className="text-xs text-gray-600 italic">
            {result.context.surrounding_text.substring(0, 150)}...
          </p>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        Document Type: {metadata.document_type || 'Meeting Notes'}
      </div>
    </div>
  )
}