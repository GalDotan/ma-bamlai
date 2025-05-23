import { PartCard } from "@/components/PartCard"
import { prisma } from "@/lib/prisma"

export default async function PartsList() {
  // Fetch all parts from the database
  const parts = await prisma.part.findMany({
    orderBy: { name: 'asc' },
  });


  // Card sizing
  const CARD_WIDTH = "270px";
  const CARD_HEIGHT = "170px";

  // Calculate columns: max 4, but if fewer items, use that number
  const colCount = Math.min(4, Math.max(1, parts.length));
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4"
  }[colCount];

  // Calculate how many empty slots to add to the last row to center it
  let emptySlots = 0;
  if (parts.length > 0 && parts.length % colCount !== 0) {
    emptySlots = colCount - (parts.length % colCount);
  }

  return (
    <div className="pt-32 px-4">
      <div
        className={`mx-auto w-full max-w-6xl grid ${gridColsClass} gap-x-0 gap-y-2 justify-center`}
        style={{ gridAutoRows: CARD_HEIGHT, justifyContent: 'center' }}
      >
        {parts.map((part: any) => (
          <div key={part.id} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
            <PartCard
              id={part.id}
              name={part.name}
              type={part.type}
              location={part.location}
            />
          </div>
        ))}
        {/* Add empty slots to center the last row if needed */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }} />
        ))}
      </div>
    </div>
  );
}


  
  