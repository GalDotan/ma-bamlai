import { getPart } from '@/app/actions/partActions';
import MoveLocationForm from '@/components/MoveLocationForm';
import EventSection from '@/components/EventSection';
import { addEvent } from '@/app/actions/partActions';
import Link from 'next/link';
import { BarcodeDisplay } from '@/components/BarcodeDisplay';

interface PartViewParams {
  id: string;
}

interface LocationHistoryEntry {
  date: string | Date;
  from?: string;
  to: string;
}

interface EventHistoryEntry {
  date: string | Date;
  description: string;
  technician: string;
}

export default async function PartView({ params }: { params: Promise<PartViewParams> }) {
  const { id } = await params;
    let part;
  try {
    part = await getPart(id);
  } catch {
    return <p className="text-center mt-40 text-2xl text-[#e74c3c]">Part not found</p>;
  }
  return (
    <div className="max-w-7xl mx-auto mt-24 md:mt-32 p-4 md:p-8 rounded-2xl md:rounded-3xl border-2 md:border-4 border-[#e74c3c] shadow-lg bg-[#181A1B] text-white font-sans text-sm md:text-lg">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">

        {/* Part Info Section */}
        <div className="lg:col-span-1 space-y-3 md:space-y-5">
          <div>
            <span className="font-bold text-lg md:text-2xl">Part Name:</span>
            <div className="text-[#e74c3c] font-bold text-lg md:text-2xl break-words">{part.name}</div>
          </div>
          

          <div>
            <span className="font-bold text-lg md:text-2xl">Type:</span>
            <div className="text-[#e74c3c] font-bold text-lg md:text-2xl">{part.partType}</div>
          </div>
          <div>  
            {part.partType === 'consumable' && (
              <div>
                <span className="font-bold text-lg md:text-2xl">Quantity:</span>
                <div className="text-[#e74c3c] font-bold text-lg md:text-2xl">{part.quantity}</div>
              </div>
            )}
          </div>
          <div>
            <span className="font-bold text-lg md:text-2xl">Year:</span>
            <div className="text-[#e74c3c] font-bold text-lg md:text-2xl">{part.year}</div>
          </div>
          <div>
            <span className="font-bold text-lg md:text-2xl">Location:</span>
            <div className="text-[#e74c3c] font-bold text-lg md:text-2xl break-words">{part.location}</div>
          </div>
          <div>
            <a href={part.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-bold text-lg md:text-2xl inline-block break-all">
              Link
            </a>
          </div>
        </div>

        {/* Location History Section */}
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <span className="font-bold text-lg md:text-2xl">Location History:</span>
          <div className="text-[#e74c3c] font-bold text-sm md:text-lg space-y-1 md:space-y-2 mt-2">
            {Array.isArray(part.locationHistory) && (part.locationHistory as unknown as LocationHistoryEntry[]).map((entry: LocationHistoryEntry, index: number) => (
              <div key={index} className="break-words">
                <span className="text-xs md:text-sm text-gray-300">{new Date(entry.date).toLocaleDateString()}</span>
                <div>{entry.to}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Event History Section */}
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <span className="font-bold text-lg md:text-2xl">Event History:</span>
          <div className="text-[#e74c3c] font-bold text-sm md:text-lg space-y-1 md:space-y-2 mt-2">
            {Array.isArray(part.eventsHistory) && ((part.eventsHistory as unknown) as EventHistoryEntry[]).map((entry: EventHistoryEntry, index: number) => (
              <div key={index} className="break-words">
                <span className="text-xs md:text-sm text-gray-300">{new Date(entry.date).toLocaleDateString()}</span>
                <div>{entry.description} ({entry.technician})</div>
              </div>
            ))}
          </div>

          <div className="mt-6 md:mt-10">
            <span className="font-bold text-lg md:text-2xl">Details:</span>
            <div className="text-[#e74c3c] font-bold text-sm md:text-lg space-y-1 md:space-y-2 mt-2 break-words">
              {part.details}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="lg:col-span-1 flex flex-col gap-3 md:gap-4 mt-6 lg:mt-0">
          <EventSection partId={part.id} addEvent={addEvent} />
          <MoveLocationForm id={part.id} />
          <Link href={`/parts/${id}/edit`} className="btn-primary text-sm md:text-lg py-2 md:py-3 px-3 text-center block">
            Edit
          </Link>
          
          {/* Barcode Display */}
          <div className="mt-4">
            <BarcodeDisplay 
              value={String(part.partNumber)} 
              name={`Part #${part.partNumber}`} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
