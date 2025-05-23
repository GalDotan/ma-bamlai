"use client";

import { createPart } from '@/app/actions/partActions';
import { useState, useTransition } from 'react';
import { toast } from 'react-toastify';

export default function NewPart() {
  const [type, setType] = useState('component');
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    // Use toast.promise for feedback, do not redirect
    await toast.promise(
      createPart(formData),
      {
        pending: 'Creating part...',
        success: 'Part created!',
        error: {
          // Type-safe error message extraction
          render({data}: {data: unknown}) {
            const err = data as { message?: string };
            return err && err.message ? `Failed: ${err.message}` : 'Failed to create part.';
          }
        }
      }
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-4 mt-40 p-6 mb-3 bg-[#181A1B] rounded-2xl shadow border-3 border-[#e74c3c]/30">
      <h1 className="card-title">Create New Part</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="form-label">Name</label>
          <input id="name" name="name" required className="form-input" />
        </div>
        <div>
          <label htmlFor="partType" className="form-label">Type</label>
          <select
            id="partType"
            name="partType"
            required
            className="form-input"
            value={type}
            onChange={e => {
              const val = e.target.value;
              setType(val);
              if (val === 'component') setQuantity(1);
            }}
          >
            <option value="component">Component</option>
            <option value="consumable">Consumable</option>
          </select>
        </div>
        <div>
          <label htmlFor="year" className="form-label">Year</label>
          <input id="year" name="year" type="text" pattern="[0-9]*" inputMode="numeric" required className="form-input" />
        </div>
        <div>
          <label htmlFor="details" className="form-label">Details</label>
          <textarea
            id="details"
            name="details"
            rows={3}
            required
            className="form-input"
          />
        </div>
        {type === 'consumable' ? (
          <div>
            <label htmlFor="quantity" className="form-label">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              value={quantity}
              min={1}
              onChange={e => setQuantity(Number(e.target.value))}
              required
              className="form-input"
            />
          </div>
        ) : (
          <input type="hidden" name="quantity" value={1} />
        )}
        <div>
          <label htmlFor="location" className="form-label">Initial Location</label>
          <input
            id="location"
            name="location"
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
            required
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="typt" className="form-label">Typt</label>
          <input
            id="typt"
            name="typt"
            required
            className="form-input"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            Create
          </button>
          <a href="/parts" className="btn-primary flex items-center justify-center px-4 py-2 no-underline !bg-gray-700 hover:!bg-[#e74c3c] !border-[#e74c3c]/40">
            Go to Parts
          </a>
        </div>
      </form>
    </div>
  );
}
