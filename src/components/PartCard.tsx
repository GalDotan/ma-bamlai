// components/PartCard.tsx
import Link from 'next/link';

export function PartCard({ id, name, partType ,location, quantity }: { id: string; name: string; partType: string; location: string; quantity?: number }) {
  return (
    <Link href={`/parts/${id}`}>
      <div className="p-6 mb-3 bg-gray-800 rounded-2xl shadow hover:shadow-lg transition cursor-pointer border-3 border-[#e74c3c]/30 hover:border-[#e74c3c]/60">
        <h2 className="text-4xl font-bold mb-2">{name}</h2>
        <p className="text-base opacity-80">{partType}</p>
        <p className="text-xl mt-2 font-medium text-[#e74c3c]">Location: {location}</p>
        {partType === 'consumable'  ? (
          <p className="text-xl mt-2 font-medium text-[#e74c3c]">Quantity: {quantity}</p>
        ) : null}
      </div>
    </Link>
  );
}
