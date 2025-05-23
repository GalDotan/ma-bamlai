"use client";
import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";


export default function EventSection({ events, partId, addEvent }: {
  events: any[];
  partId: string;
  addEvent: (formData: FormData) => Promise<any>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleForm() {
    if (formRef.current) {
      formRef.current.classList.toggle("hidden");
    }
  }

  async function handleAddEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await addEvent(formData);
    form.reset();
    if (formRef.current) formRef.current.classList.add("hidden");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <label className="form-label mb-0">Events</label>
        {/* Small + icon button to toggle event form */}
        <button
          type="button"
          className="flex items-center justify-center p-0 bg-transparent border-none text-white align-middle"
          aria-label="Add Event"
          onClick={toggleForm}
          style={{ height: '1.25rem', width: '1.25rem' }} // text-base = 1.25rem
        >
          <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" style={{ display: 'block' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <ul className="list-disc ml-6 text-base mb-2">
        {events.length === 0 && <li className="text-gray-500">No events</li>}
        {events.map((ev, i) => (
          <li key={i}>
            <span className="font-semibold">{ev.date ? new Date(ev.date).toLocaleDateString() : ''}:</span> {ev.description} <span className="italic text-gray-400">({ev.technician})</span>
          </li>
        ))}
      </ul>
      <form ref={formRef} onSubmit={handleAddEvent} className="flex flex-col gap-2 mt-2 hidden">
        <input type="hidden" name="id" value={partId} />
        <input name="description" placeholder="Event description" required className="form-input" />
        <input name="technician" placeholder="Technician" required className="form-input" />
        <button type="submit" className="btn-primary" disabled={isPending}>Add Event</button>
      </form>
    </div>
  );
}
