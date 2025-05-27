import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnumber: string }> }
) {
  try {
    const { partnumber } = await params;
    const partNumber = parseInt(partnumber);
    
    if (isNaN(partNumber)) {
      return NextResponse.json({ error: "Invalid part number" }, { status: 400 });
    }

    const part = await prisma.part.findFirst({
      where: {
        partNumber: partNumber
      }
    });

    if (!part) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    return NextResponse.json(part);
  } catch (error) {
    console.error("Error finding part by partNumber:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
