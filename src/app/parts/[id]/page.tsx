// src/app/parts/[id]/page.tsx
interface PartViewParams {
  id: string;
}


import { updateQuantity, addEvent } from '@/app/actions/partActions';
import EventSection from '@/components/EventSection';
import MoveLocationForm from '@/components/MoveLocationForm';
import { prisma } from '@/lib/prisma';

export default async function PartView({ params }: { params: PartViewParams }) {
  const { id } = params; // Destructure params to access id
  const p = await prisma.part.findUnique({ where: { id } });
  if (!p) return <p className="text-center mt-40 text-2xl text-red-400">Not found</p>;

  return (
    <div className="max-w-sm mx-auto space-y-6 mt-40 p-6 mb-3 bg-[#181A1B] rounded-2xl shadow border-3 border-[#e74c3c]/30">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Part Name:</label>
          <div className="text-red-500 font-semibold">{p.name}</div>
        </div>
        <div>
          <label className="form-label">Location History:</label>
          <div className="text-red-500 font-semibold">
            {Array.isArray(p.locationHistory) && p.locationHistory.map((entry, index) => (
              <div key={index}>{typeof entry === 'string' ? entry : JSON.stringify(entry)}</div>
            ))}
          </div>
        </div>
        <div>
          <label className="form-label">Type:</label>
          <div className="text-red-500 font-semibold">{p.partType}</div>
        </div>
        <div>
          <label className="form-label">Event History:</label>
          <div className="text-red-500 font-semibold">
            {Array.isArray(p.eventsHistory) && p.eventsHistory.map((entry, index) => (
              <div key={index}>{typeof entry === 'string' ? entry : JSON.stringify(entry)}</div>
            ))}
          </div>
        </div>
        <div>
          <label className="form-label">Year:</label>
          <div className="text-red-500 font-semibold">{p.year}</div>
        </div>
        <div>
          <label className="form-label">Location:</label>
          <div className="text-red-500 font-semibold">{p.location}</div>
        </div>
        <div>
          <label className="form-label">Link:</label>
          <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {p.link}
          </a>
        </div>
      </div>
      <div className="flex flex-col space-y-2 mt-4">
        <button className="btn-primary">New Event</button>
        <button className="btn-primary">Move</button>
        <button className="btn-primary">Edit</button>
      </div>
    </div>
  );
}
