import { useState, useEffect } from 'react'
import { CalendarDays, MapPin, Building } from 'lucide-react'

interface SearchFiltersProps {
  filters: {
    programs: string[]
    agencies: string[]
    date_from: string
    date_to: string
    search_method: 'semantic' | 'keyword' | 'hybrid'
  }
  onChange: (filters: any) => void
}

const AVAILABLE_PROGRAMS = [
  'Chicago', 'Detroit', 'Atlanta', 'Cleveland', 'Newark', 'Fresno',
  'Omaha', 'Minneapolis', 'Philadelphia', 'Los Angeles', 'Dallas',
  'Fort Worth', 'Gary', 'Grand Rapids', 'Indianapolis', 'Wichita',
  'Tulsa', 'Spokane', 'San Diego'
]

const AVAILABLE_AGENCIES = [
  'City Council', 'Planning Commission', 'Zoning Board', 'School Board',
  'Housing Authority', 'Transit Authority', 'Police Commission',
  'Parks and Recreation', 'Public Health Department', 'Building Commission',
  'Budget Committee'
]

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const handleProgramChange = (program: string) => {
    const newPrograms = filters.programs.includes(program)
      ? filters.programs.filter(p => p !== program)
      : [...filters.programs, program]
    
    onChange({ ...filters, programs: newPrograms })
  }

  const handleAgencyChange = (agency: string) => {
    const newAgencies = filters.agencies.includes(agency)
      ? filters.agencies.filter(a => a !== agency)
      : [...filters.agencies, agency]
    
    onChange({ ...filters, agencies: newAgencies })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold text-gray-800 mb-4">Search Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Programs/Cities */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <MapPin size={16} className="mr-1" />
            Cities/Programs
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            {AVAILABLE_PROGRAMS.map(program => (
              <label key={program} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={filters.programs.includes(program)}
                  onChange={() => handleProgramChange(program)}
                  className="mr-2 text-purple-600"
                />
                <span className="text-sm">{program}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Agencies */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Building size={16} className="mr-1" />
            Agencies
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            {AVAILABLE_AGENCIES.map(agency => (
              <label key={agency} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={filters.agencies.includes(agency)}
                  onChange={() => handleAgencyChange(agency)}
                  className="mr-2 text-purple-600"
                />
                <span className="text-sm">{agency}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range & Search Method */}
        <div className="space-y-4">
          {/* Date Range */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <CalendarDays size={16} className="mr-1" />
              Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
                className="w-full px-3 py-1 border border-gray-200 rounded text-sm"
                placeholder="From"
              />
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
                className="w-full px-3 py-1 border border-gray-200 rounded text-sm"
                placeholder="To"
              />
            </div>
          </div>

          {/* Search Method */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Search Method
            </label>
            <select
              value={filters.search_method}
              onChange={(e) => onChange({ ...filters, search_method: e.target.value as any })}
              className="w-full px-3 py-1 border border-gray-200 rounded text-sm"
            >
              <option value="hybrid">Hybrid (Recommended)</option>
              <option value="semantic">Semantic Only</option>
              <option value="keyword">Keyword Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={() => onChange({
            programs: [],
            agencies: [],
            date_from: '',
            date_to: '',
            search_method: 'hybrid' as const
          })}
          className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </div>
  )
}