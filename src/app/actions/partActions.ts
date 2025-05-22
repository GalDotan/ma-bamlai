/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/partActions.ts
'use server';
import { prisma } from '@/lib/prisma';

// Create Part
export async function createPart(form: FormData) {
  const data = {
    name: form.get('name') as string,
    type: form.get('type') as string,
    year: Number(form.get('year')),
    details: form.get('details') as string,
    quantity: Number(form.get('quantity')),
    quantityHistory: [],
    location: form.get('location') as string,
    locationHistory: [],
    eventsHistory: []
  };
  await prisma.part.create({ data });
}

// Move Part
export async function movePart(form: FormData) {
  const id = form.get('id') as string;
  const newLocation = form.get('location') as string;
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) throw new Error('Not found');
  const hist = (part.locationHistory as any[]) || [];
  hist.push({ date: new Date(), from: part.location, to: newLocation });
  await prisma.part.update({
    where: { id },
    data: { location: newLocation, locationHistory: hist }
  });
}

// Add Event (components only)
export async function addEvent(form: FormData) {
  const id = form.get('id') as string;
  const description = form.get('description') as string;
  const technician = form.get('technician') as string;
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) throw new Error('Not found');
  const evs = (part.eventsHistory as any[]) || [];
  evs.push({ date: new Date(), description, technician });
  await prisma.part.update({
    where: { id },
    data: { eventsHistory: evs }
  });
}

// Update Quantity (consumables only)
export async function updateQuantity(form: FormData) {
  const id = form.get('id') as string;
  const newQty = Number(form.get('quantity'));
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) throw new Error('Not found');
  const hist = (part.quantityHistory as any[]) || [];
  hist.push({ date: new Date(), prev: part.quantity, new: newQty });
  await prisma.part.update({
    where: { id },
    data: { quantity: newQty, quantityHistory: hist }
  });
}
