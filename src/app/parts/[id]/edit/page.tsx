'use client';

import { getPart, updatePart } from '@/app/actions/partActions';
import { useEffect, useState, useTransition, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

// Raw data types that match the JSON structure
interface BaseHistoryEntry {
  date: string;
}

interface RawQuantityHistoryEntry extends BaseHistoryEntry {
  prevQuantity?: number;
  newQuantity?: number;
  from?: number;
  to?: number;
}

interface RawLocationHistoryEntry extends BaseHistoryEntry {
  from: string | null;
  to: string;
}

interface RawEventHistoryEntry extends BaseHistoryEntry {
  description: string;
  technician: string;
}

// Processed types with proper Date objects
interface QuantityHistoryEntry {
  date: Date;
  from: number;
  to: number;
}

interface LocationHistoryEntry {
  date: Date;
  from: string | null;
  to: string;
}

interface EventHistoryEntry {
  date: Date;
  description: string;
  technician: string;
}

// Raw data from Prisma
interface RawPartData {
  id: string;
  name: string;
  partType: string;
  typt: string;
  year: number;
  details: string | null;
  quantity: number;
  location: string;
  link: string;
  barcode: string;
  quantityHistory: RawQuantityHistoryEntry[];
  locationHistory: RawLocationHistoryEntry[];
  eventsHistory: RawEventHistoryEntry[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Processed Part type
interface Part {
  id: string;
  name: string;
  partType: string;
  typt: string;
  year: number;
  details: string | null;
  quantity: number;
  location: string;
  link: string;
  barcode: string;
  quantityHistory: QuantityHistoryEntry[];
  locationHistory: LocationHistoryEntry[];
  eventsHistory: EventHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export default function EditPartPage() {
  const { id } = useParams();
  const router = useRouter();
  const [part, setPart] = useState<Part | null>(null);
  const [isPending, startTransition] = useTransition();

  const parseHistoryEntries = useCallback((data: unknown): Part => {
    const rawData = data as RawPartData;
    return {
      ...rawData,
      createdAt: new Date(rawData.createdAt),
      updatedAt: new Date(rawData.updatedAt),
      quantityHistory: (rawData.quantityHistory ?? []).map(entry => ({
        date: new Date(entry.date),
        from: entry.prevQuantity ?? entry.from ?? 0,
        to: entry.newQuantity ?? entry.to ?? 0
      })),
      locationHistory: (rawData.locationHistory ?? []).map(entry => ({
        date: new Date(entry.date),
        from: entry.from,
        to: entry.to
      })),
      eventsHistory: (rawData.eventsHistory ?? []).map(entry => ({
        date: new Date(entry.date),
        description: entry.description,
        technician: entry.technician
      }))
    };
  }, []);

  useEffect(() => {
    async function fetchPart() {
      try {
        const partData = await getPart(id as string);
        const parsedPart = parseHistoryEntries(partData);
        setPart(parsedPart);
      } catch {
        console.error('Failed to fetch part');
        toast.error('Failed to load part');
      }
    }
    fetchPart();
  }, [id, parseHistoryEntries]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Type-safe form data validation
    const year = parseInt(formData.get('year') as string);
    const quantity = parseInt(formData.get('quantity') as string);

    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      toast.error('Please enter a valid year');
      return;
    }

    if (isNaN(quantity) || quantity < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    startTransition(async () => {
      try {
        await updatePart(id as string, formData);
        toast.success('Part updated!');
        router.push(`/parts/${id}`);
      } catch (error) {
        console.error('Error updating part:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update part');
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
          <textarea id="details"
            name="details"
            rows={3}
            defaultValue={part.details || ''}
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
