"use client";
import { movePart } from '@/app/actions/partActions';
import { SubmitButton } from './SubmitButton';

export default function MoveLocationForm({ id }: { id: string }) {
  return (
    <form action={movePart} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="location"
        placeholder="New location"
        required
        className="form-input h-11 px-3 w-full"
      />
      <SubmitButton 
        className="btn-primary h-11 px-4 py-2 text-sm md:text-lg rounded-md flex items-center justify-center w-full" 
        pendingText="Moving..."
      >
        Move
      </SubmitButton>
    </form>
  );
}
