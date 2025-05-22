// src/app/parts/[id]/page.tsx
interface PartViewParams {
  id: string;
}

import { movePart } from '@/app/actions/partActions';
import { prisma } from '@/lib/prisma';

export default async function PartView({ params }: { params: PartViewParams }) {
    const p = await prisma.part.findUnique({ where: { id: params.id } })
    if (!p) return <p>Not found</p>
  
    return (
      <div className="card max-w-lg mx-auto space-y-6">
        <h1 className="card-title">{p.name}</h1>
        {/* location form */}
        <div>
          <label className="form-label">Location</label>
          <form action={movePart} className="flex space-x-2">
            <input type="hidden" name="id" value={p.id} />
            <input
              name="location"
              placeholder="New location"
              required
              className="form-input flex-1"
            />
            <button type="submit" className="btn-primary">
              Move
            </button>
          </form>
        </div>
        {/* …other sections… */}
      </div>
    )
  }
  