// File: src/app/parts/new/page.tsx
// (make this a Server Component—no 'use client' needed)
import { createPart } from '@/app/actions/partActions'

export default function NewPart() {
  return (
    <div className="card max-w-sm mx-auto space-y-4">
      <h1 className="card-title">Create New Part</h1>

      <form action={createPart} className="space-y-4">
        <div>
          <label htmlFor="name"     className="form-label">Name</label>
          <input id="name"   name="name"     required className="form-input" />
        </div>

        <div>
          <label htmlFor="type"     className="form-label">Type</label>
          <select id="type" name="type" required className="form-input">
            <option value="component">Component</option>
            <option value="consumable">Consumable</option>
          </select>
        </div>

        <div>
          <label htmlFor="year"     className="form-label">Year</label>
          <input id="year"   name="year"     type="number" required className="form-input" />
        </div>

        <div>
          <label htmlFor="details"  className="form-label">Details</label>
          <textarea
            id="details"
            name="details"
            rows={3}
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
            defaultValue={1}
            required
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="location" className="form-label">Initial Location</label>
          <input
            id="location"
            name="location"
            required
            className="form-input"
          />
        </div>

        <button type="submit" className="btn-primary">
          Create
        </button>
      </form>
    </div>
  )
}
