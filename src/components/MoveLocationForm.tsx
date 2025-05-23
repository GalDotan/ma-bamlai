"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { movePart } from '@/app/actions/partActions';

export default function MoveLocationForm({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleMove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await movePart(formData);
    form.reset();
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleMove} className="flex gap-2 mt-2 items-center">
      <input type="hidden" name="id" value={id} />
      <input
        name="location"
        placeholder="New location"
        required
        className="form-input h-11 px-3"
        style={{ minWidth: 0 }}
      />
      <button
        type="submit"
        className="btn-primary h-11 px-2 py-2 text-sm rounded-md flex items-center"
        style={{ marginTop: 0, marginBottom: 0, alignSelf: 'center' }}
        disabled={isPending}
      >
        Move
      </button>
    </form>
  );
}
