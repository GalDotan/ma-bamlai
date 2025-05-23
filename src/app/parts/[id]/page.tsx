// src/app/parts/[id]/page.tsx
interface PartViewParams {
  id: string;
}


import { updateQuantity, addEvent } from '@/app/actions/partActions';
import EventSection from '@/components/EventSection';
import MoveLocationForm from '@/components/MoveLocationForm';
import { prisma } from '@/lib/prisma';

export default async function PartView({ params }: { params: PartViewParams }) {
  const p = await prisma.part.findUnique({ where: { id: params.id } });
  if (!p) return <p className="text-center mt-40 text-2xl text-red-400">Not found</p>;

  return (
    <div className="max-w-sm mx-auto space-y-6 mt-40 p-6 mb-3 bg-[#181A1B] rounded-2xl shadow border-3 border-[#e74c3c]/30">
      <h1 className="card-title">{p.name}</h1>
      <div className="space-y-4">
        {/* Type hidden as requested */}
        <div>
          <label className="form-label">Year</label>
          <div className="text-lg font-semibold text-white">{p.year}</div>
        </div>
        <div>
          <label className="form-label">Details</label>
          <div className="text-base text-white/90">{p.details}</div>
        </div>
        <div>
          <label className="form-label">Location</label>
          <div className="text-lg font-semibold text-white">{p.location}</div>
        </div>
        {/* Edit Location */}
        <MoveLocationForm id={p.id} />

        {/* Quantity (for consumables) */}
        {p.type === 'consumable' && (
          <div className="mt-4">
            <label className="form-label">Quantity</label>
            <div className="text-lg font-semibold text-white">{p.quantity}</div>
            <form action={updateQuantity} className="flex space-x-2 mt-2">
              <input type="hidden" name="id" value={p.id} />
              <input
                name="quantity"
                type="number"
                min={1}
                defaultValue={p.quantity}
                required
                className="form-input flex-1"
              />
              <button type="submit" className="btn-primary">Update</button>
            </form>
          </div>
        )}

        {/* Events (for components) */}
        {p.type === 'component' && (
          <EventSection events={p.eventsHistory as any[] ?? []} partId={p.id} addEvent={addEvent} />
        )}
      </div>
    </div>
  );
}
  