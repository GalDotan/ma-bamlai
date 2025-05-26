"use client";

import { createPart } from '@/app/actions/partActions';
import { useState, Suspense } from 'react';
import { SubmitButton } from '@/components/SubmitButton';
import { toast } from 'react-toastify';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

export default function NewPart() {
  const [type, setType] = useState('component');
  const [quantity, setQuantity] = useState(1);

  async function handleSubmit(formData: FormData) {
    try {
      await createPart(formData);
      toast.success('Part created!');
      // Reset form by reloading the page or using a ref
      window.location.reload();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to create part');
    }
  }
  return (
    <>
      <Suspense fallback={null}>
        <NavBar />
      </Suspense>
      <div className="max-w-sm mx-auto space-y-4 mt-24 md:mt-40 p-4 md:p-6 mb-3 bg-[#181A1B] rounded-2xl shadow border-3 border-[#e74c3c]/30">
        <h1 className="card-title text-lg md:text-2xl">Create New Part</h1>
        <form action={handleSubmit} className="space-y-3 md:space-y-4">
          <div>
            <label htmlFor="name" className="form-label text-sm md:text-base">Name</label>
            <input id="name" name="name" required className="form-input text-sm md:text-base" />
          </div>
          <div>
            <label htmlFor="partType" className="form-label text-sm md:text-base">Type</label>
            <select
              id="partType"
              name="partType"
              required
              className="form-input text-sm md:text-base"
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
            <label htmlFor="year" className="form-label text-sm md:text-base">Year</label>
            <input id="year" name="year" type="text" pattern="[0-9]*" inputMode="numeric" required className="form-input text-sm md:text-base" />
          </div>
          <div>
            <label htmlFor="details" className="form-label text-sm md:text-base">Details</label>          <textarea
              id="details"
              name="details"
              rows={3}
              className="form-input text-sm md:text-base"
            />
          </div>
          {type === 'consumable' ? (
            <div>
              <label htmlFor="quantity" className="form-label text-sm md:text-base">Quantity</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={quantity}
                min={1}
                onChange={e => setQuantity(Number(e.target.value))}
                required
                className="form-input text-sm md:text-base"
              />
            </div>
          ) : (
            <input type="hidden" name="quantity" value={1} />
          )}
          <div>
            <label htmlFor="location" className="form-label text-sm md:text-base">Initial Location</label>
            <input
              id="location"
              name="location"
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
              required
              className="form-input text-sm md:text-base"
            />
          </div>
          <div>
            <label htmlFor="typt" className="form-label text-sm md:text-base">Typt</label>
            <input
              id="typt"
              name="typt"
              required
              className="form-input text-sm md:text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <SubmitButton pendingText="Creating..." className="btn-primary text-sm md:text-base">
              Create
            </SubmitButton>
            <Link href="/parts" className="btn-primary flex items-center justify-center px-4 py-2 no-underline !bg-gray-700 hover:!bg-[#e74c3c] !border-[#e74c3c]/40 text-sm md:text-base">
              Go to Parts
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
