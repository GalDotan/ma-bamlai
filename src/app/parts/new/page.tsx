// app/parts/new/page.tsx
import { createPart } from '@/app/actions/partActions';

export default function NewPart() {
  return (
    <form action={createPart} className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl">Create New Part</h1>

      <div>
        <label>Name</label>
        <input name="name" required className="w-full p-2 rounded bg-gray-700" />
      </div>

      <div>
        <label>Type</label>
        <select name="type" required className="w-full p-2 rounded bg-gray-700">
          <option value="component">Component</option>
          <option value="consumable">Consumable</option>
        </select>
      </div>

      <div>
        <label>Year</label>
        <input name="year" type="number" required className="w-full p-2 rounded bg-gray-700" />
      </div>

      <div>
        <label>Details</label>
        <textarea name="details" required className="w-full p-2 rounded bg-gray-700" />
      </div>

      <div>
        <label>Quantity</label>
        <input name="quantity" type="number" defaultValue={1} required className="w-full p-2 rounded bg-gray-700" />
      </div>

      <div>
        <label>Initial Location</label>
        <input name="location" required className="w-full p-2 rounded bg-gray-700" />
      </div>

      <button type="submit" className="px-4 py-2 bg-primary rounded-xl">Create</button>
    </form>
  );
}
