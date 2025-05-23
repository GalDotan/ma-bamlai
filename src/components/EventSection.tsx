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
    startTransition(() => {
      router.refresh();
    });
  }

  return (
      <form onSubmit={handleAddEvent} className="flex flex-col gap-2 mt-2 ">
        <input type="hidden" name="id" value={partId} />
        <input name="description" placeholder="Event description" required className="form-input" />
        <input name="technician" placeholder="Technician" required className="form-input" />
        <button type="submit" className="btn-primary" disabled={isPending}>Add Event</button>
      </form>
  );
}
