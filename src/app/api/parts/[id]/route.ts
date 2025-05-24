import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const part = await prisma.part.findUnique({ where: { id } });

    if (!part) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 });
    }

    return NextResponse.json(part);
  } catch (error) {
    console.error('Error fetching part:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() ?? '';
    const partType = formData.get('partType')?.toString() ?? '';
    const typt = formData.get('typt')?.toString() ?? '';
    const yearStr = formData.get('year')?.toString();
    const details = formData.get('details')?.toString() ?? '';
    const quantityStr = formData.get('quantity')?.toString();
    const location = formData.get('location')?.toString() ?? '';
    const link = formData.get('link')?.toString() ?? '';

    if (!name || !partType || !yearStr || !quantityStr || !location || !link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const year = parseInt(yearStr, 10);
    const quantity = parseInt(quantityStr, 10);

    const updatedPart = await prisma.part.update({
      where: { id },
      data: {
        name,
        partType,
        typt,
        year,
        details,
        quantity,
        location,
        link,
      },
    });

    return NextResponse.json(updatedPart);
  } catch (error) {
    console.error('Error updating part:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
