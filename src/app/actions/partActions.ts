// File: src/app/actions/partActions.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Create Part
export async function createPart(form: FormData) {
  // Pull every field off the FormData and coerce to string
  const name       = form.get('name')?.toString()       ?? '';
  const partType   = form.get('partType')?.toString()   ?? ''; // Updated field name
  const typt       = form.get('typt')?.toString()       ?? ''; // New field
  const yearStr    = form.get('year')?.toString();
  const details    = form.get('details')?.toString()    ?? '';
  const quantityStr= form.get('quantity')?.toString();
  const location   = form.get('location')?.toString()   ?? '';
  const link       = form.get('link')?.toString()       ?? ''; // Ensure link is included

  // Basic server‐side check
  if (!name || !partType || yearStr === undefined || quantityStr === undefined || !link) {
    throw new Error('Missing required fields: name, partType, year, quantity, or link');
  }

  const year     = parseInt(yearStr, 10);
  const quantity = parseInt(quantityStr, 10);

  await prisma.part.create({
    data: {
      name,
      partType, // Updated field name
      typt,     // New field
      year,
      details,
      quantity,
      quantityHistory: [],
      location,
      locationHistory: [],
      eventsHistory: [],
      link, // Added link field
    },
  });
  // Do not redirect; let the client handle navigation if needed
}

// Move Part
export async function movePart(form: FormData) {
  const id = form.get('id')?.toString()    ?? '';
  const newLocation = form.get('location')?.toString() ?? '';
  if (!id || !newLocation) throw new Error('Missing id or new location');
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) throw new Error('Part not found');
  const hist = (part.locationHistory as any[]) || [];
  hist.push({ date: new Date(), from: part.location, to: newLocation });
  await prisma.part.update({
    where: { id },
    data: { location: newLocation, locationHistory: hist }
  });
}

// Add Event (components only)
export async function addEvent(form: FormData) {
  const id          = form.get('id')?.toString()           ?? '';
  const description = form.get('description')?.toString() ?? '';
  const technician  = form.get('technician')?.toString()  ?? '';
  if (!id || !description || !technician) throw new Error('Missing event data');
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) throw new Error('Part not found');
  const evs = (part.eventsHistory as any[]) || [];
  evs.push({ date: new Date(), description, technician });
  await prisma.part.update({
    where: { id },
    data: { eventsHistory: evs }
  });
}

// Update Quantity (consumables only)
export async function updateQuantity(form: FormData) {
  const id       = form.get('id')?.toString()    ?? '';
  const newQtyStr = form.get('quantity')?.toString();
  if (!id || newQtyStr === undefined) throw new Error('Missing id or quantity');
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) throw new Error('Part not found');
  const newQty = parseInt(newQtyStr, 10);
  const hist = (part.quantityHistory as any[]) || [];
  hist.push({ date: new Date(), prev: part.quantity, new: newQty });
  await prisma.part.update({
    where: { id },
    data: { quantity: newQty, quantityHistory: hist }
  });
}
