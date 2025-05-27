'use client'

import { useState, useEffect } from 'react'
import { CiGrid41 } from 'react-icons/ci'
import { Filter, Menu as MenuIcon, X as CloseIcon, BarChart } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import FilterModal from './FilterModal'
import { getAllLocations } from '@/app/actions/partActions'
import dynamic from 'next/dynamic'
import { Montserrat } from 'next/font/google'

const BarcodeScanner = dynamic(
  () => import('./BarcodeScanner').then(mod => mod.BarcodeScanner),
  { ssr: false }
)

const montserrat = Montserrat({ subsets: ['latin'], weight: '700' });

interface FilterState {
  partTypes: string[]
  locations: string[]
  sortBy: 'name' | 'year' | 'lastEvent' | 'locationHistory'
  yearRange: [number, number]
  lastEventRange: [number, number]
}

export default function NavBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    partTypes: [],
    locations: [],
    sortBy: 'name',
    yearRange: [2000, new Date().getFullYear()],
    lastEventRange: [0, 365],
  })
  const [allLocations, setAllLocations] = useState<string[]>([])
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Fetch locations
  useEffect(() => {
    getAllLocations()
      .then(setAllLocations)
      .catch(() =>
        setAllLocations([
          'Warehouse A',
          'Warehouse B',
          'Workshop',
          'Storage Room',
          'Office',
          'Lab',
        ])
      )
  }, [])

  // Sync URL params → state on /parts
  useEffect(() => {
    if (pathname !== '/parts') return
    const currentYear = new Date().getFullYear()
    setSearch(searchParams.get('search') || '')
    setFilters(() => ({
      partTypes: searchParams.get('partTypes')?.split(',').filter(Boolean) || [],
      locations: searchParams.get('locations')?.split(',').filter(Boolean) || [],
      sortBy: (searchParams.get('sortBy') as FilterState['sortBy']) ?? 'name',
      yearRange: [
        parseInt(searchParams.get('yearMin') || '2000'),
        parseInt(searchParams.get('yearMax') || `${currentYear}`),
      ],
      lastEventRange: [
        parseInt(searchParams.get('eventMin') || '0'),
        parseInt(searchParams.get('eventMax') || '365'),
      ],
    }))
  }, [pathname, searchParams])

  

  // Debounce search → URL
  useEffect(() => {
    if (pathname !== '/parts') return
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (search) params.set('search', search)
      else params.delete('search')
      router.push(`/parts?${params.toString()}`, { scroll: false })
    }, 150)
    return () => clearTimeout(t)
  }, [search, pathname, router, searchParams])

  

  const toggleMenu = () => setIsMenuOpen(v => !v)

  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters)
    const params = new URLSearchParams(searchParams)
    params.delete('partTypes')
    params.delete('locations')
    params.delete('sortBy')
    params.delete('yearMin')
    params.delete('yearMax')
    params.delete('eventMin')
    params.delete('eventMax')
    if (newFilters.partTypes.length)
      params.set('partTypes', newFilters.partTypes.join(','))
    if (newFilters.locations.length)
      params.set('locations', newFilters.locations.join(','))
    if (newFilters.sortBy !== 'name') params.set('sortBy', newFilters.sortBy)
    if (newFilters.yearRange[0] !== 2000)
      params.set('yearMin', `${newFilters.yearRange[0]}`)
    if (newFilters.yearRange[1] !== new Date().getFullYear())
      params.set('yearMax', `${newFilters.yearRange[1]}`)
    if (newFilters.lastEventRange[0] !== 0)
      params.set('eventMin', `${newFilters.lastEventRange[0]}`)
    if (newFilters.lastEventRange[1] !== 365)
      params.set('eventMax', `${newFilters.lastEventRange[1]}`)

    router.push(`/parts?${params.toString()}`, { scroll: false })

    const hasActiveFilters = filters.partTypes.length > 0 || 
                           filters.locations.length > 0 || 
                           filters.sortBy !== 'name' ||
                           filters.yearRange[0] !== 2000 ||
                           filters.yearRange[1] !== new Date().getFullYear() ||
                           filters.lastEventRange[0] !== 0 ||
                           filters.lastEventRange[1] !== 365;

    setIsFilterModalOpen(false)
  }

  // Determine if any filters are active (for filter button highlight)
  const hasActiveFilters = filters.partTypes.length > 0 || 
    filters.locations.length > 0 || 
    filters.sortBy !== 'name' ||
    filters.yearRange[0] !== 2000 ||
    filters.yearRange[1] !== new Date().getFullYear() ||
    filters.lastEventRange[0] !== 0 ||
    filters.lastEventRange[1] !== 365;

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-16 md:h-20 bg-gray-900/95 backdrop-blur flex justify-between items-center px-4 z-50">
        {/* LEFT */}
        <div className="flex items-center">
          <button
            onClick={toggleMenu}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-white"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
          <span className={`hidden md:inline-block text-white text-5xl ${montserrat.className}`}>
            MAbmlai
          </span>
        </div>

        {/* CENTER: grow and cap width */}
        <div className="flex-1 flex justify-center px-4">
          <div className="flex items-center space-x-2 w-full max-w-xs md:max-w-md">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-2 py-3 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e74c3c]">
                🔍
              </span>
            </div>

            {/* Camera & Filter (never shrink) */}
            <div className="flex-shrink-0 flex space-x-2">
              

              {pathname === '/parts' && (
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  aria-label="Filter"
                  className={`
                    w-10 h-10 md:w-12 md:h-12
                    flex items-center justify-center
                    rounded-full
                    border-2 
                    transition-shadow shadow-md
                   ${
                                hasActiveFilters 
                                    ? 'bg-[#e74c3c] border-[#e74c3c] text-white' 
                                    : 'bg-gray-800 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] text-[#e74c3c] hover:text-white'
                            }
                    
                  `}
                >
                  <Filter size={16} className="md:w-6 md:h-6" />
                </button>
              )}
              <BarcodeScanner />
            </div>
          </div>
        </div>

        {/* RIGHT (desktop only) */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => router.push('/manage')}
            className="hidden md:flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-gray-800 border-2 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] text-[#e74c3c]"
            aria-label="Manage"
          >
            <BarChart size={20} />
          </button>
          <button
            onClick={() => router.push('/parts/new')}
            className="hidden md:flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-gray-800 border-2 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] text-[#e74c3c]"
            aria-label="New Part"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="10" y1="3" x2="10" y2="17" />
              <line x1="3" y1="10" x2="17" y2="10" />
            </svg>
          </button>
          <button
            onClick={() => router.push('/parts')}
            className="hidden md:flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-gray-800 border-2 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] text-[#e74c3c]"
            aria-label="Parts"
          >
            <CiGrid41 size={20} />
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <nav className="fixed top-16 left-0 w-full bg-[#181A1B] shadow-lg z-40 p-4 space-y-2">
          <button
            onClick={() => {
              router.push('/parts')
              toggleMenu()
            }}
            className="w-full text-left text-white py-2 rounded hover:bg-gray-700"
          >
            All Parts
          </button>
          <button
            onClick={() => {
              router.push('/parts/new')
              toggleMenu()
            }}
            className="w-full text-left text-white py-2 rounded hover:bg-gray-700"
          >
            Create New Part
          </button>
          <button
            onClick={() => {
              router.push('/manage')
              toggleMenu()
            }}
            className="w-full text-left text-white py-2 rounded hover:bg-gray-700"
          >
            Manage Inventory
          </button>
        </nav>
      )}

      {/* FILTER MODAL */}
      {pathname === '/parts' && isFilterModalOpen && (
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={applyFilters}
          allLocations={allLocations}
          currentFilters={filters}
        />
      )}
    </>
  )
}
