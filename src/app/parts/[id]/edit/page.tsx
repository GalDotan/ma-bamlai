'use client';

import { prisma } from '@/lib/prisma';
import { updatePart } from '@/app/actions/partActions';
import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function EditPartPage() {
  const { id } = useParams();
  const router = useRouter();
  const [part, setPart] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState('component');

  useEffect(() => {
    async function fetchPart() {
      const res = await fetch(`/api/parts?id=${id}`);
      const all = await res.json();
      const match = all.find((p: any) => p.id === id);
      if (match) {
        setPart(match);
        setType(match.partType);
      }
    }
    fetchPart();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    await toast.promise(
      fetch(`/api/parts/${id}`, {
        method: 'PUT',
        body: formData,
      }),
      {
        pending: 'Updating part...',
        success: 'Part updated!',
        error: 'Failed to update part',
      }
    );

    router.push(`/parts/${id}`);
  }

  if (!part) {
    return <p className="text-center mt-40 text-xl text-gray-400">Loading...</p>;
  }

  return (
    <div className="max-w-sm mx-auto space-y-4 mt-40 p-6 mb-3 bg-[#181A1B] rounded-2xl shadow border-3 border-[#e74c3c]/30">
      <h1 className="card-title">Edit Part</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="id" value={part.id} />
        <div>
          <label htmlFor="name" className="form-label">Name</label>
          <input id="name" name="name" defaultValue={part.name} required className="form-input" />
        </div>
        <div>
          <label htmlFor="partType" className="form-label">Type</label>
          <select
            id="partType"
            name="partType"
            defaultValue={part.partType}
            required
            className="form-input"
          >
            <option value="component">Component</option>
            <option value="consumable">Consumable</option>
          </select>
        </div>
        <div>
          <label htmlFor="year" className="form-label">Year</label>
          <input
            id="year"
            name="year"
            type="text"
            defaultValue={part.year}
            required
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="details" className="form-label">Details</label>
          <textarea
            id="details"
            name="details"
            rows={3}
            defaultValue={part.details}
            required
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="quantity" className="form-label">Quantity</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            defaultValue={part.quantity}
            required
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="location" className="form-label">Location</label>
          <input
            id="location"
            name="location"
            defaultValue={part.location}
            required
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="link" className="form-label">Link</label>
          <input
            id="link"
            name="link"
            type="url"
            defaultValue={part.link}
            required
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="typt" className="form-label">Typt</label>
          <input
            id="typt"
            name="typt"
            defaultValue={part.typt}
            required
            className="form-input"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            Update
          </button>
          <a href={`/parts/${id}`} className="btn-primary">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
