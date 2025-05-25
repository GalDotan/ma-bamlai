"use client";
import { SubmitButton } from './SubmitButton';

export default function EventSection({ partId, addEvent }: {
  partId: string;
  addEvent: (formData: FormData) => Promise<void>;
}) {
  return (
      <form action={addEvent} className="flex flex-col gap-2 mt-2">
        <input type="hidden" name="id" value={partId} />
        <input name="description" placeholder="Event description" required className="form-input text-sm md:text-base" />
        <input name="technician" placeholder="Technician" required className="form-input text-sm md:text-base" />
        <SubmitButton pendingText="Adding..." className="btn-primary text-sm md:text-base">Add Event</SubmitButton>
      </form>
  );
}
