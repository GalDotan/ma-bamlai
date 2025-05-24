"use client";

import { use, useEffect, useState } from 'react';
import { prisma } from '@/lib/prisma';
import MoveLocationForm from '@/components/MoveLocationForm';
import EventSection from '@/components/EventSection';
import { addEvent } from '@/app/actions/partActions';
import { useRouter } from 'next/navigation';

interface PartViewParams {
  id: string;
}

export default function PartView({ params }: { params: Promise<PartViewParams> }) {
  const { id } = use(params);
  const [part, setPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPart() {
      try {
        const response = await fetch(`/api/parts/${id}`);
        const data = await response.json();
        setPart(data);
      } catch (error) {
        console.error('Failed to fetch part:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPart();
  }, [id]);

  if (loading) return <p className="text-center mt-40 text-2xl text-[#e74c3c]">Loading...</p>;
  if (!part) return <p className="text-center mt-40 text-2xl text-[#e74c3c]">Not found</p>;

  return (
    <div className="max-w-7xl mx-auto mt-32 p-8 rounded-3xl border-4 border-[#e74c3c] shadow-lg bg-[#181A1B] text-white font-sans text-lg">
      <div className="grid grid-cols-4 gap-8 items-start">

        {/* Left Column: Part Info */}
        <div className="col-span-1 space-y-5">
          <div>
            <span className="font- text-2xl">Part Name:</span>
            <div className="text-[#e74c3c] font-bold text-2xl">{part.name}</div>
          </div>
          <div>
            <span className="font- text-2xl">Type:</span>
            <div className="text-[#e74c3c] font-bold text-2xl">{part.typt}</div>
          </div>
          <div>  
            {part.partType === 'consumable' && (
              <div>
                <span className="font- text-2xl">Quantity:</span>
                <div className="text-[#e74c3c] font-bold text-2xl ">{part.quantity}</div>
              </div>
            )}
          </div>
          <div>
            <span className="font- text-2xl">Year:</span>
            <div className="text-[#e74c3c] font-bold text-2xl">{part.year}</div>
          </div>
          <div>
            <span className="font- text-2xl">Location:</span>
            <div className="text-[#e74c3c] font-bold text-2xl">{part.location}</div>
          </div>
          <div>
            <a href={part.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 font-bold text-2xl">
              Link
            </a>
          </div>
        </div>

        {/* Middle Column: Location History */}
        <div className="col-span-1">
          <span className="font- text-2xl">Location History:</span>
          <div className="text-[#e74c3c] font-bold text-lg space-y-2 mt-2">
            {Array.isArray(part.locationHistory) && part.locationHistory.map((entry: any, index: number) => (
              <div key={index}>
                {new Date(entry.date).toLocaleDateString()} {entry.to}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Event History */}
        <div className="col-span-1">
          <span className="font- text-2xl">Event History:</span>
          <div className="text-[#e74c3c] font- text-lg space-y-2 mt-2">
            {Array.isArray(part.eventsHistory) && part.eventsHistory.map((entry: any, index: number) => (
              <div key={index}>
                {new Date(entry.date).toLocaleDateString()} {entry.description} ({entry.technician})
              </div>
            ))}
          </div>

          <div className="mt-10">
            <span className="font- text-2xl">Details:</span>
            <div className="text-[#e74c3c] font- text-lg space-y-2 mt-2">
              {part.details}
            </div>
          </div>
        </div>

        {/* Rightmost Column: Forms */}
        <div className="col-span-1 flex flex-col gap-4">
          <EventSection events={Array.isArray(part.eventsHistory) ? part.eventsHistory : []} partId={part.id} addEvent={addEvent} />
          <MoveLocationForm id={part.id} />
          <button
            className="btn-primary text-lg py-3 px-3"
            onClick={() => router.push(`/parts/${id}/edit`)}
          >
            Edit
          </button>
        </div>

        {/* Details Section */}

      </div>
    </div>
  );
}
