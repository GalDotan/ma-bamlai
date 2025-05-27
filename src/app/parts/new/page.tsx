"use client";

import { createPart, getNextPartNumber } from '@/app/actions/partActions';
import { useState, Suspense, useEffect } from 'react';
import { SubmitButton } from '@/components/SubmitButton';
import { toast } from 'react-toastify';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function NewPart() {
  const router = useRouter(); // Initialize router
  const [type, setType] = useState('component');
  const [quantity, setQuantity] = useState(1);
  const [nextPartNumber, setNextPartNumber] = useState<number | null>(null);

  useEffect(() => {
    // Load the next available part number
    getNextPartNumber().then(setNextPartNumber).catch(() => {
      // If error, don't show anything
      setNextPartNumber(null);
    });
  }, []);
  async function handleSubmit(formData: FormData) {
    try {
      await createPart(formData);
      toast.success('Part created!');
      // Use router.refresh() instead of window.location.reload()
      router.refresh();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to create part');
      
      // Refresh the next part number in case it changed
      getNextPartNumber().then(setNextPartNumber).catch(() => {
        setNextPartNumber(null);
      });
    }
  }
  return (
    <>
      <Suspense fallback={null}>
        <NavBar />
      </Suspense>
      <div className="max-w-sm mx-auto space-y-4 mt-24 md:mt-40 p-4 md:p-6 mb-3 bg-[#181A1B] rounded-2xl shadow border-3 border-[#e74c3c]/30">
        <h1 className="card-title text-lg md:text-2xl">Create New Part</h1>        <form action={handleSubmit} className="space-y-3 md:space-y-4">          <div>
            <label htmlFor="partNumber" className="form-label text-sm md:text-base">Part Number (optional)</label>
            <input 
              id="partNumber" 
              name="partNumber" 
              type="number" 
              min="1" 
              placeholder={nextPartNumber ? `Leave empty for auto-generated (next: ${nextPartNumber})` : "Leave empty for auto-generated"}
              className="form-input text-sm md:text-base" 
            />
            <div className="text-xs text-gray-400 mt-1">
              {nextPartNumber 
                ? `Next available number: ${nextPartNumber}` 
                : "If not provided, the next available number will be used"
              }
            </div>
          </div>
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
          </div>          <div>
            <label htmlFor="year" className="form-label text-sm md:text-base">
              Year {type === 'component' ? '(optional)' : ''}
            </label>
            <input 
              id="year" 
              name="year" 
              type="text" 
              pattern="[0-9]*" 
              inputMode="numeric" 
              required={type !== 'component'}
              className="form-input text-sm md:text-base" 
            />
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
