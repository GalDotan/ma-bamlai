// app/parts/page.tsx
import { prisma } from '@/lib/prisma';
import { PartCard } from '@/components/PartCard';

export default async function PartsList() {
  const parts = await prisma.part.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">All Parts</h1>
        <a href="/parts/new" className="px-4 py-2 bg-primary rounded-xl">+ New Part</a>
      </div>
      {parts.map((p) => (
        <PartCard key={p.id} id={p.id} name={p.name} type={p.type} location={p.location} />
      ))}
    </section>
  );
}
