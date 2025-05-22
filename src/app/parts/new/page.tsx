'use client'
import { createPart } from '@/app/actions/partActions'

export default function NewPart() {
  return (
    <form action={createPart} className="card max-w-sm mx-auto space-y-4">
      <h1 className="card-title">Create New Part</h1>

      <div>
        <label className="form-label">Name</label>
        <input
          name="name"
          required
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">Type</label>
        <select
          name="type"
          required
          className="form-input"
        >
          <option value="component">Component</option>
          <option value="consumable">Consumable</option>
        </select>
      </div>

      {/* …and so on for Year, Details, Quantity, Location… */}

      <button type="submit" className="btn-primary">
        Create
      </button>
    </form>
  )
}
