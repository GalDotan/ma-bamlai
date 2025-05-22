// components/PartCard.tsx
import Link from 'next/link';

export function PartCard({ id, name, type, location }: { id: string; name: string; type: string; location: string }) {
  return (
    <Link href={`/parts/${id}`}>
      <div className="p-4 mb-3 bg-gray-800 rounded-2xl shadow hover:shadow-lg transition">
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-sm opacity-75">{type}</p>
        <p className="text-sm mt-1">Location: {location}</p>
      </div>
    </Link>
  );
}
