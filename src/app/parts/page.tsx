import { PartCard } from "@/components/PartCard"
import { prisma } from "@/lib/prisma" // Ensure prisma is imported from the correct path

// src/app/parts/page.tsx
export default async function PartsList() {
    const parts = await prisma.part.findMany()
  
    return (
      <div className="card max-w-lg mx-auto space-y-4">
        <h1 className="card-title">All Parts</h1>
        {parts.map(p => (
          <PartCard key={p.id} {...p} />
        ))}
        <a href="/parts/new" className="btn-primary">
          + New Part
        </a>
      </div>
    )
  }
  