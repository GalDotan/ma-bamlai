'use client';

import { getPart, updatePart } from '@/app/actions/partActions';
import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface Part {
  id: string;
  name: string;
  partType: string;
  typt: string;
  year: number;
  details: string;
  quantity: number;
  location: string;
  link: string;
}

export default function EditPartPage() {
  const { id } = useParams();
  const router = useRouter();
  const [part, setPart] = useState<Part | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchPart() {      try {
        const partData = await getPart(id as string);
        setPart(partData);
      } catch {
        console.error('Failed to fetch part');
        toast.error('Failed to load part');
      }
    }
    fetchPart();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {      try {
        await updatePart(id as string, formData);
        toast.success('Part updated!');
        router.push(`/parts/${id}`);
      } catch {
        toast.error('Failed to update part');
      }
    });
  }

  if (!part) {
    return <p className="text-center mt-40 text-xl text-gray-400">Loading...</p>;
  }
  return (
    <div className="max-w-sm mx-auto space-y-4 mt-24 md:mt-40 p-4 md:p-6 mb-3 bg-[#181A1B] rounded-2xl shadow border-3 border-[#e74c3c]/30">
      <h1 className="card-title text-lg md:text-2xl">Edit Part</h1>
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        <input type="hidden" name="id" value={part.id} />
        <div>
          <label htmlFor="name" className="form-label text-sm md:text-base">Name</label>
          <input id="name" name="name" defaultValue={part.name} required className="form-input text-sm md:text-base" />
        </div>
        <div>
          <label htmlFor="partType" className="form-label text-sm md:text-base">Type</label>
          <select
            id="partType"
            name="partType"
            defaultValue={part.partType}
            required
            className="form-input text-sm md:text-base"
          >
            <option value="component">Component</option>
            <option value="consumable">Consumable</option>
          </select>
        </div>
        <div>
          <label htmlFor="year" className="form-label text-sm md:text-base">Year</label>
          <input
            id="year"
            name="year"
            type="text"
            defaultValue={part.year}
            required
            className="form-input text-sm md:text-base"
          />
        </div>
        <div>
          <label htmlFor="details" className="form-label text-sm md:text-base">Details</label>
          <textarea
            id="details"
            name="details"
            rows={3}
            defaultValue={part.details}
            required
            className="form-input text-sm md:text-base"
          />
        </div>
        <div>
          <label htmlFor="quantity" className="form-label text-sm md:text-base">Quantity</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            defaultValue={part.quantity}
            required
            className="form-input text-sm md:text-base"
          />
        </div>
        <div>
          <label htmlFor="location" className="form-label text-sm md:text-base">Location</label>
          <input
            id="location"
            name="location"
            defaultValue={part.location}
            required
            className="form-input text-sm md:text-base"
          />
        </div>
        <div>
          <label htmlFor="link" className="form-label text-sm md:text-base">Link</label>
          <input
            id="link"
            name="link"
            type="url"
            defaultValue={part.link}
            required
            className="form-input text-sm md:text-base"
          />
        </div>
        <div>
          <label htmlFor="typt" className="form-label text-sm md:text-base">Typt</label>
          <input
            id="typt"
            name="typt"
            defaultValue={part.typt}
            required
            className="form-input text-sm md:text-base"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button type="submit" className="btn-primary text-sm md:text-base" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update'}
          </button>
          <a href={`/parts/${id}`} className="btn-primary text-sm md:text-base text-center !bg-gray-700 hover:!bg-[#e74c3c] !border-[#e74c3c]/40 no-underline">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
