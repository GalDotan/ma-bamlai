/* eslint-disable @typescript-eslint/no-explicit-any */
// app/parts/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { movePart, addEvent, updateQuantity } from '@/app/actions/partActions';

interface Params { params: { id: string } }
export default async function PartView({ params }: Params) {
  const p = await prisma.part.findUnique({ where: { id: params.id } });
  if (!p) return <p>Not found</p>;

  const qtyHist = p.quantityHistory as any[];
  const locHist = p.locationHistory as any[];
  const evHist = p.eventsHistory as any[];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl">{p.name}</h1>
      <p>Type: {p.type}</p>
      <p>Year: {p.year}</p>
      <p>Details: {p.details}</p>

      {/* Location */}
      <section className="space-y-2">
        <h2 className="text-xl">Location</h2>
        <p className="mb-2">{p.location}</p>
        <form action={movePart} className="flex space-x-2">
          <input type="hidden" name="id" value={p.id} />
          <input name="location" placeholder="New location" required className="p-2 rounded bg-gray-700" />
          <button type="submit" className="px-3 rounded bg-primary">Move</button>
        </form>
        <ul className="list-disc ml-6 opacity-75">
          {locHist.map((h, i) => (
            <li key={i}>{new Date(h.date).toLocaleString()} — {h.from} → {h.to}</li>
          ))}
        </ul>
      </section>

      {/* Quantity (consumables) */}
      {p.type === 'consumable' && (
        <section className="space-y-2">
          <h2 className="text-xl">Quantity</h2>
          <p className="mb-2">{p.quantity}</p>
          <form action={updateQuantity} className="flex space-x-2">
            <input type="hidden" name="id" value={p.id} />
            <input name="quantity" type="number" placeholder="New qty" required className="p-2 rounded bg-gray-700" />
            <button type="submit" className="px-3 rounded bg-primary">Update</button>
          </form>
          <ul className="list-disc ml-6 opacity-75">
            {qtyHist.map((h, i) => (
              <li key={i}>{new Date(h.date).toLocaleString()} — {h.prev} → {h.new}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Events (components) */}
      {p.type === 'component' && (
        <section className="space-y-2">
          <h2 className="text-xl">Events</h2>
          <form action={addEvent} className="space-y-2">
            <input type="hidden" name="id" value={p.id} />
            <input name="description" placeholder="Description" required className="w-full p-2 rounded bg-gray-700" />
            <input name="technician" placeholder="Technician" required className="w-full p-2 rounded bg-gray-700" />
            <button type="submit" className="px-3 rounded bg-primary">Add Event</button>
          </form>
          <ul className="list-disc ml-6 opacity-75">
            {evHist.map((e, i) => (
              <li key={i}>{new Date(e.date).toLocaleString()} — {e.description} (by {e.technician})</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
