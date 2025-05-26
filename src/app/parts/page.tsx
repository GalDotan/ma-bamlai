import { PartCard } from "@/components/PartCard";
import { getParts } from "@/app/actions/partActions";
import NavBar from "@/components/NavBar";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface PartsPageProps {
  searchParams: Promise<{ 
    search?: string;
    barcode: string;  // Add barcode parameter
    partTypes?: string;
    locations?: string;
    sortBy?: 'name' | 'year' | 'lastEvent' | 'locationHistory';
    yearMin?: string;
    yearMax?: string;
    eventMin?: string;
    eventMax?: string;
  }>;
}

interface FilterParams {
  partTypes?: string[];
  locations?: string[];
  sortBy?: 'name' | 'year' | 'lastEvent' | 'locationHistory';
  yearRange?: [number, number];
  lastEventRange?: [number, number];
}

function parseFilters(searchParams: Record<string, string | undefined>): FilterParams | undefined {
  const filters: FilterParams = {};
  
  if (searchParams.partTypes) {
    filters.partTypes = searchParams.partTypes.split(',').filter(Boolean);
  }
  
  if (searchParams.locations) {
    filters.locations = searchParams.locations.split(',').filter(Boolean);
  }
  
  if (searchParams.sortBy) {
    filters.sortBy = searchParams.sortBy as 'name' | 'year' | 'lastEvent' | 'locationHistory';
  }
  
  if (searchParams.yearMin || searchParams.yearMax) {
    const currentYear = new Date().getFullYear();
    filters.yearRange = [
      searchParams.yearMin ? parseInt(searchParams.yearMin) : 2000,
      searchParams.yearMax ? parseInt(searchParams.yearMax) : currentYear
    ];
  }
  
  if (searchParams.eventMin || searchParams.eventMax) {
    filters.lastEventRange = [
      searchParams.eventMin ? parseInt(searchParams.eventMin) : 0,
      searchParams.eventMax ? parseInt(searchParams.eventMax) : 365
    ];
  }
  
  return Object.keys(filters).length > 0 ? filters : undefined;
}

export default async function PartsList({ searchParams }: PartsPageProps) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search || '';
  const barcode = resolvedSearchParams.barcode;
  const filters = parseFilters(resolvedSearchParams);  // If barcode is provided, get the part directly from prisma
  if (barcode) {
    const part = await prisma.part.findFirst({
      where: { 
        barcode: {
          equals: barcode
        }
      }
    });
    if (part) {
      redirect(`/parts/${part.id}`);
    }
  }

  const parts = await getParts(search, filters);

  return (
    <div className="pt-20 md:pt-32 px-2 md:px-4">
      <NavBar />
      <div className="mx-auto w-full max-w-7xl">
        {/* Mobile: Single column, full width cards */}
        <div className="block md:hidden space-y-4">
          {parts.map((part) => (
            <div key={part.id} className="w-full">
              <PartCard
                id={part.id}
                name={part.name}
                partType={part.partType}
                location={part.location}
                quantity={part.quantity}
              />
            </div>
          ))}
        </div>
        
        {/* Desktop: Grid layout */}
        <div className="hidden md:grid gap-2 overflow-auto" style={{ 
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '8px'
        }}>
          {parts.map((part) => (
            <div key={part.id} style={{ width: '270px', height: '200px' }}>
              <PartCard
                id={part.id}
                name={part.name}
                partType={part.partType}
                location={part.location}
                quantity={part.quantity}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



