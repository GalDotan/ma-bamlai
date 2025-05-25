'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}

export function SubmitButton({ children, className = "btn-primary", pendingText = "Loading..." }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      className={className} 
      disabled={pending}
    >
      {pending ? pendingText : children}
    </button>
  )
}
