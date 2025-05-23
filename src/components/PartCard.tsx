// components/PartCard.tsx
import Link from 'next/link';

export function PartCard({ id, name, type, location }: { id: string; name: string; type: string; location: string }) {
  return (
    <Link href={`/parts/${id}`}>
      <div className="p-6 mb-3 bg-gray-800 rounded-2xl shadow hover:shadow-lg transition cursor-pointer border-3 border-[#e74c3c]/30 hover:border-[#e74c3c]/60">
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        <p className="text-base opacity-80">{type}</p>
        <p className="text-lg mt-2 font-medium text-[#e74c3c]">Location: {location}</p>
      </div>
    </Link>
  );
}
