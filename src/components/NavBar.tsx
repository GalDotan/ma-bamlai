'use client'

import { useState, useEffect } from "react";
import { CiGrid41 } from "react-icons/ci";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import FilterModal from "./FilterModal";
import { getAllLocations } from "@/app/actions/partActions";
import { Camera, BarChart } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

interface FilterState {
  partTypes: string[]; // Changed to array for multi-select
  locations: string[]; // Changed to array for multi-select
  sortBy: 'name' | 'year' | 'lastEvent' | 'locationHistory';
  yearRange: [number, number];
  lastEventRange: [number, number];
}

export default function NavBar() {
    const [search, setSearch] = useState("");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [allLocations, setAllLocations] = useState<string[]>([]);
    const [filters, setFilters] = useState<FilterState>({
      partTypes: [],
      locations: [],
      sortBy: 'name',
      yearRange: [2000, new Date().getFullYear()],
      lastEventRange: [0, 365]
    });
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Fetch locations on component mount
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const locations = await getAllLocations();
                setAllLocations(locations);
            } catch (error) {
                console.error('Failed to fetch locations:', error);
                // Fallback to mock data
                setAllLocations(["Warehouse A", "Warehouse B", "Workshop", "Storage Room", "Office", "Lab"]);
            }
        };
        fetchLocations();
    }, []);useEffect(() => {
        // Initialize search from URL params only if we're on the parts page
        if (pathname === '/parts') {
            const initialSearch = searchParams.get('search') || '';
            setSearch(initialSearch);
              // Initialize filters from URL params
            const currentYear = new Date().getFullYear();
            
            // Parse multi-select arrays from URL params
            const partTypesParam = searchParams.get('partTypes');
            const locationsParam = searchParams.get('locations');
            
            const urlFilters: FilterState = {
                partTypes: partTypesParam ? partTypesParam.split(',').filter(Boolean) : [],
                locations: locationsParam ? locationsParam.split(',').filter(Boolean) : [],
                sortBy: (searchParams.get('sortBy') as 'name' | 'year' | 'lastEvent' | 'locationHistory') || 'name',
                yearRange: [
                    parseInt(searchParams.get('yearMin') || '2000'),
                    parseInt(searchParams.get('yearMax') || currentYear.toString())
                ],
                lastEventRange: [
                    parseInt(searchParams.get('eventMin') || '0'),
                    parseInt(searchParams.get('eventMax') || '365')
                ]
            };
            setFilters(urlFilters);
        } else {
            setSearch(''); // Clear search when not on parts page
            // Reset filters when not on parts page
            setFilters({
                partTypes: [],
                locations: [],
                sortBy: 'name',
                yearRange: [2000, new Date().getFullYear()],
                lastEventRange: [0, 365]
            });
        }
    }, [searchParams, pathname]);

    useEffect(() => {
        // Only update search params if we're on the parts page
        if (pathname !== '/parts') {
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (search) {
                params.set('search', search);
            } else {
                params.delete('search');
            }
            router.push(`/parts?${params.toString()}`, { scroll: false });
        }, 150); // Reduced debounce time for faster response

        return () => clearTimeout(delayDebounceFn);
    }, [search, router, searchParams, pathname]);    const handleApplyFilters = (newFilters: FilterState) => {
        setFilters(newFilters);
        
        // Update URL params with filter values
        const params = new URLSearchParams(searchParams);
        
        // Clear existing filter params
        params.delete('partTypes');
        params.delete('locations');
        params.delete('sortBy');
        params.delete('yearMin');
        params.delete('yearMax');
        params.delete('eventMin');
        params.delete('eventMax');
        
        // Add new filter params
        if (newFilters.partTypes.length > 0) {
            params.set('partTypes', newFilters.partTypes.join(','));
        }
        
        if (newFilters.locations.length > 0) {
            params.set('locations', newFilters.locations.join(','));
        }
        
        if (newFilters.sortBy !== 'name') {
            params.set('sortBy', newFilters.sortBy);
        }
        
        const currentYear = new Date().getFullYear();
        if (newFilters.yearRange[0] !== 2000) {
            params.set('yearMin', newFilters.yearRange[0].toString());
        }
        if (newFilters.yearRange[1] !== currentYear) {
            params.set('yearMax', newFilters.yearRange[1].toString());
        }
        
        if (newFilters.lastEventRange[0] !== 0) {
            params.set('eventMin', newFilters.lastEventRange[0].toString());
        }
        if (newFilters.lastEventRange[1] !== 365) {
            params.set('eventMax', newFilters.lastEventRange[1].toString());
        }
        
        router.push(`/parts?${params.toString()}`, { scroll: false });
    };    const hasActiveFilters = filters.partTypes.length > 0 || 
                           filters.locations.length > 0 || 
                           filters.sortBy !== 'name' ||
                           filters.yearRange[0] !== 2000 ||
                           filters.yearRange[1] !== new Date().getFullYear() ||
                           filters.lastEventRange[0] !== 0 ||
                           filters.lastEventRange[1] !== 365;

    return (
        <header className="backdrop-blur bg-gray-900/95 grid grid-cols-3 md:grid-cols-3 items-center fixed top-0 left-0 w-full z-50 h-16 md:h-20 px-2 md:px-0">
            <div className="col-start-1 flex items-center gap-2 md:gap-3 justify-self-start ml-2 md:ml-10">
                <span className="text-lg md:text-2xl font-extrabold tracking-tight text-white drop-shadow">MAbmlai</span>
            </div>

            <div className="col-start-2 flex justify-center w-full px-2 md:px-0">
                <div className="flex items-center gap-1 md:gap-2 w-full max-w-xs md:max-w-md">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                if (pathname !== '/parts' && e.target.value.trim()) {
                                    router.push('/parts');
                                }
                            }}
                            placeholder="Search..."
                            className="w-full pl-8 md:pl-12 pr-3 md:pr-4 py-1.5 md:py-2 text-sm md:text-base rounded-full border-none bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e74c3c] shadow-lg transition-all duration-200"
                        />
                        <span className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-[#e74c3c]">
                            <svg width="16" height="16" className="md:w-5 md:h-5" fill="none" stroke="#e74c3c" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                    </div>
                    
                    {pathname === '/parts' && (
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 transition-all duration-150 shadow-md ${
                                hasActiveFilters 
                                    ? 'bg-[#e74c3c] border-[#e74c3c] text-white' 
                                    : 'bg-gray-800 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] text-[#e74c3c] hover:text-white'
                            }`}
                            aria-label="Filter parts"
                        >
                            <Filter className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="col-start-3 flex items-center gap-1 md:gap-4 justify-self-end mr-2 md:mr-10">
                <div className="flex gap-1 md:gap-2">
                    <button
                        className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-gray-800 border-2 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] transition-all duration-150 shadow-md group"
                        aria-label="Scan barcode"
                        onClick={() => setIsScannerOpen(true)}
                    >
                        <Camera className="w-4 h-4 md:w-6 md:h-6 text-[#e74c3c] group-hover:text-white" />
                    </button>
                    <button
                        className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-gray-800 border-2 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] transition-all duration-150 shadow-md group"
                        aria-label="Go to management"
                        onClick={() => router.push('/manage')}
                    >
                        <BarChart className="w-4 h-4 md:w-6 md:h-6 text-[#e74c3c] group-hover:text-white" />
                    </button>
                    <button
                        className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-gray-800 border-2 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] transition-all duration-150 shadow-md group"
                        aria-label="Create new part"
                        onClick={() => router.push('/parts/new')}
                    >
                        <svg width="18" height="18" className="md:w-7 md:h-7 text-[#e74c3c] transition-colors duration-150 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <button
                        className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-gray-800 border-2 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] transition-all duration-150 shadow-md group"
                        aria-label="Go to parts"
                        onClick={() => router.push('/parts')}
                    >
                        <CiGrid41 size={18} className="md:text-[28px] text-[#e74c3c] group-hover:text-white" />
                    </button>
                </div>
            </div>

            <FilterModal 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApplyFilters={handleApplyFilters}
                allLocations={allLocations}
                currentFilters={filters}
            />
            
            <BarcodeScanner 
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
            />
        </header>
    );
}