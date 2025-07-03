import { Calendar, MapPin, Building } from 'lucide-react'

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

  return (
    <div className="border-4 border-black bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow">
      {/* Header */}
      <div className="mb-3">
        <h4 className="font-bold text-black mb-2 text-lg">
          {metadata.assignment_name || 'Unknown Meeting'}
        </h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <span className="flex items-center bg-white border-2 border-black p-1 font-medium">
            <Building size={14} className="mr-1" />
            {metadata.agency}
          </span>
          <span className="flex items-center bg-white border-2 border-black p-1 font-medium">
            <MapPin size={14} className="mr-1" />
            {metadata.program}
          </span>
          <span className="flex items-center bg-white border-2 border-black p-1 font-medium">
            <Calendar size={14} className="mr-1" />
            {formatDate(metadata.meeting_date)}
          </span>
        </div>
      </div>

      {/* Content Preview */}
      <div className="text-black font-medium leading-relaxed bg-white border-2 border-black p-3">
        {text.length > 200 ? (
          <>
            {text.substring(0, 200)}
            <span className="font-bold">...</span>
          </>
        ) : (
          text
        )}
      </div>

      {/* Search Type Badge */}
      <div className="mt-3">
        <span className="bg-yellow-400 border-2 border-black px-2 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {search_type} match
        </span>
      </div>
    </div>
  )
}