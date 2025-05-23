import { prisma } from '@/lib/prisma';

interface PartViewParams {
  id: string;
}

export default async function PartView({ params }: { params: PartViewParams }) {
  const { id } = params;
  const p = await prisma.part.findUnique({ where: { id } });
  if (!p) return <p className="text-center mt-40 text-2xl text-[#e74c3c]">Not found</p>;

  return (
    <div className="max-w-6xl mx-auto mt-24 p-6 rounded-2xl border-2 border-[#e74c3c] shadow-md bg-[#181A1B] text-white font-sans">
      <div className="grid grid-cols-4 gap-6 items-start">

        {/* Left Column: Part Info */}
        <div className="col-span-1 space-y-3">
          <div>
            <span className="font-semibold">Part Name:</span>
            <div className="text-[#e74c3c] font-bold">{p.name}</div>
          </div>
          <div>
            <span className="font-semibold">Type:</span>
            <div className="text-[#e74c3c] font-bold">{p.partType}</div>
          </div>
          <div>
            <span className="font-semibold">Year:</span>
            <div className="text-[#e74c3c] font-bold">{p.year}</div>
          </div>
          <div>
            <span className="font-semibold">Location:</span>
            <div className="text-[#e74c3c] font-bold">{p.location}</div>
          </div>
          <div>
      
            <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-semibold">
              Link
            </a>
          </div>
        </div>

        {/* Middle Column: Location History */}
        <div className="col-span-1">
          <span className="font-semibold">Location History:</span>
          <div className="text-[#e74c3c] font-semibold space-y-1 mt-1">
            {Array.isArray(p.locationHistory) && p.locationHistory.map((entry: any, index: number) => (
              <div key={index}>
                {new Date(entry.date).toLocaleDateString()} {entry.to}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Event History */}
        <div className="col-span-1">
          <span className="font-semibold">Event History:</span>
          <div className="text-[#e74c3c] font-semibold space-y-1 mt-1">
            {Array.isArray(p.eventsHistory) && p.eventsHistory.map((entry: any, index: number) => (
              <div key={index}>
                {new Date(entry.date).toLocaleDateString()} {entry.description}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="col-span-1 flex flex-col gap-3">
          <button className="btn-primary">New Event</button>
          <button className="btn-primary">Move</button>
          <button className="btn-primary">Edit</button>
        </div>
      </div>
    </div>
  );
}
