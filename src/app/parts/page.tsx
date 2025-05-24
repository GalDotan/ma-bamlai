"use client";

import { PartCard } from "@/components/PartCard";
import { prisma } from "@/lib/prisma";
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar"; // Adjust the import based on your file structure

export default function PartsList() {
  const [parts, setParts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchParts() {
      const response = await fetch(
        `/api/parts?search=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setParts(data);
    }

    fetchParts();
  }, [searchQuery]);

  // Card sizing
  const CARD_WIDTH = "270px";
  const CARD_HEIGHT = "200px";

  return (
    <div className="pt-32 px-4">
      <NavBar onSearch={setSearchQuery} />
      <div
        className="mx-auto w-full grid gap-2 overflow-auto"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${CARD_WIDTH}, 1fr))`, gap: '8px' }}
      >
        {parts.map((part: any) => (
          <div key={part.id} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
            <PartCard
              id={part.id}
              name={part.name}
              partType={part.partType}
              location={part.location}
              quantity={part.quantity}
            />
          </div>
        ))}
      </div>
    </div>
  );
}



