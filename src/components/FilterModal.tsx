/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react';
import { X, Filter, RotateCcw, ChevronDown, Check } from 'lucide-react';

interface FilterState {
  partTypes: string[]; // Changed to array for multi-select
  locations: string[]; // Changed to array for multi-select
  sortBy: 'name' | 'year' | 'lastEvent' | 'locationHistory';
  yearRange: [number, number];
  lastEventRange: [number, number]; // Days ago
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  allLocations: string[];
  currentFilters: FilterState;
}

const PART_TYPES = ['component', 'consumable'];

export default function FilterModal({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  allLocations,
  currentFilters 
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [locationSearch, setLocationSearch] = useState('');
  const [partTypeSearch, setPartTypeSearch] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isPartTypeDropdownOpen, setIsPartTypeDropdownOpen] = useState(false);
  
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const partTypeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
      if (partTypeDropdownRef.current && !partTypeDropdownRef.current.contains(event.target as Node)) {
        setIsPartTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = allLocations.filter(location =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const filteredPartTypes = PART_TYPES.filter(type =>
    type.toLowerCase().includes(partTypeSearch.toLowerCase())
  );

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      partTypes: [],
      locations: [],
      sortBy: 'name',
      yearRange: [2000, new Date().getFullYear()],
      lastEventRange: [0, 365]
    };
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const toggleLocation = (location: string) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }));
  };

  const togglePartType = (partType: string) => {
    setFilters(prev => ({
      ...prev,
      partTypes: prev.partTypes.includes(partType)
        ? prev.partTypes.filter(t => t !== partType)
        : [...prev.partTypes, partType]
    }));
  };

  if (!isOpen) return null;
  return (
    <div className="mt-1/2 fixed inset-0 bg-[#1b1b1bc2] w-screen h-screen z-[60] flex items-center justify-center p-4">
      <div className="bg-[#181A1B] rounded-2xl border-2 border-[#e74c3c] w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#e74c3c]" />
            <h2 className="text-lg md:text-xl font-bold text-white">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-6">
          {/* Part Type Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Part Type ({filters.partTypes.length} selected)
            </label>
            <div className="relative" ref={partTypeDropdownRef}>
              <button
                onClick={() => setIsPartTypeDropdownOpen(!isPartTypeDropdownOpen)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#e74c3c] flex items-center justify-between"
              >
                <span className="text-left">
                  {filters.partTypes.length === 0 
                    ? 'Select part types...' 
                    : filters.partTypes.length === PART_TYPES.length 
                    ? 'All types selected'
                    : `${filters.partTypes.length} types selected`
                  }
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isPartTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isPartTypeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search types..."
                      value={partTypeSearch}
                      onChange={(e) => setPartTypeSearch(e.target.value)}
                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#e74c3c]"
                    />
                  </div>
                  {filteredPartTypes.map((type) => (
                    <div
                      key={type}
                      onClick={() => togglePartType(type)}
                      className="flex items-center px-3 py-2 hover:bg-gray-600 cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-4 h-4 mr-2 border border-gray-500 rounded">
                        {filters.partTypes.includes(type) && (
                          <Check className="w-3 h-3 text-[#e74c3c]" />
                        )}
                      </div>
                      <span className="text-white text-sm capitalize">{type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location ({filters.locations.length} selected)
            </label>
            <div className="relative" ref={locationDropdownRef}>
              <button
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#e74c3c] flex items-center justify-between"
              >
                <span className="text-left">
                  {filters.locations.length === 0 
                    ? 'Select locations...' 
                    : filters.locations.length === allLocations.length 
                    ? 'All locations selected'
                    : `${filters.locations.length} locations selected`
                  }
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search locations..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#e74c3c]"
                    />
                  </div>
                  {filteredLocations.map((location) => (
                    <div
                      key={location}
                      onClick={() => toggleLocation(location)}
                      className="flex items-center px-3 py-2 hover:bg-gray-600 cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-4 h-4 mr-2 border border-gray-500 rounded">
                        {filters.locations.includes(location) && (
                          <Check className="w-3 h-3 text-[#e74c3c]" />
                        )}
                      </div>
                      <span className="text-white text-sm">{location}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          
          
          
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-700">
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-md transition-colors font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #e74c3c;
          cursor: pointer;
          border: 2px solid #fff;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #e74c3c;
          cursor: pointer;
          border: 2px solid #fff;
        }
      `}</style>
    </div>
  );
}
