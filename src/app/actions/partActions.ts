// File: src/app/actions/partActions.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { revalidatePath } from 'next/cache';
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
  
  revalidatePath('/parts');
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
  hist.push({ date: new Date(), from: part.location, to: newLocation });  await prisma.part.update({
    where: { id },
    data: { location: newLocation, locationHistory: hist }
  });
  
  revalidatePath('/parts');
  revalidatePath(`/parts/${id}`);
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
  evs.push({ date: new Date(), description, technician });  await prisma.part.update({
    where: { id },
    data: { eventsHistory: evs }
  });
  
  revalidatePath('/parts');
  revalidatePath(`/parts/${id}`);
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
  hist.push({ date: new Date(), prev: part.quantity, new: newQty });  await prisma.part.update({
    where: { id },
    data: { quantity: newQty, quantityHistory: hist }
  });
  
  revalidatePath('/parts');
  revalidatePath(`/parts/${id}`);
}

export async function updatePart(id: string, form: FormData) {
  const name = form.get('name')?.toString() ?? '';
  const partType = form.get('partType')?.toString() ?? '';
  const typt = form.get('typt')?.toString() ?? '';
  const yearStr = form.get('year')?.toString();
  const details = form.get('details')?.toString() ?? '';
  const quantityStr = form.get('quantity')?.toString();
  const location = form.get('location')?.toString() ?? '';
  const link = form.get('link')?.toString() ?? '';

  if (!name || !partType || !yearStr || !quantityStr || !location || !link) {
    throw new Error('Missing required fields');
  }

  const year = parseInt(yearStr, 10);
  const quantity = parseInt(quantityStr, 10);
  await prisma.part.update({
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
  
  revalidatePath('/parts');
  revalidatePath(`/parts/${id}`);
}

// Get Parts with Search and Filters
interface FilterParams {
  search?: string;
  partTypes?: string[];
  locations?: string[];
  sortBy?: 'name' | 'year' | 'lastEvent' | 'locationHistory';
  yearRange?: [number, number];
  lastEventRange?: [number, number]; // Days ago
}

export async function getParts(search: string = '', filters?: FilterParams) {
  // Build where clause
  const where: any = {};
  
  // Search filter
  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive',
    };
  }
    // Part types filter (array)
  if (filters?.partTypes && filters.partTypes.length > 0) {
    where.partType = {
      in: filters.partTypes
    };
  }
  
  // Locations filter (array)
  if (filters?.locations && filters.locations.length > 0) {
    where.location = {
      in: filters.locations
    };
  }
  
  // Year range filter
  if (filters?.yearRange) {
    where.year = {
      gte: filters.yearRange[0],
      lte: filters.yearRange[1],
    };
  }
  
  // Build order by clause
  let orderBy: any = { name: 'asc' }; // default
  
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'year':
        orderBy = { year: 'desc' };
        break;
      case 'lastEvent':
        // This would require more complex logic to sort by last event date
        // For now, we'll just use name as fallback
        orderBy = { name: 'asc' };
        break;
      case 'locationHistory':
        // This would require more complex logic to sort by location history
        // For now, we'll just use location
        orderBy = { location: 'asc' };
        break;
    }
  }
  
  const parts = await prisma.part.findMany({
    where,
    orderBy,
  });
  
  // Apply lastEvent filter if needed (post-processing since it involves JSON field)
  let filteredParts = parts;
  if (filters?.lastEventRange) {
    const now = new Date();
    const [minDays, maxDays] = filters.lastEventRange;
    
    filteredParts = parts.filter(part => {
      const events = (part.eventsHistory as any[]) || [];
      if (events.length === 0) {
        // No events - consider this as very old
        return maxDays >= 365;
      }
      
      const lastEvent = events[events.length - 1];
      const lastEventDate = new Date(lastEvent.date);
      const daysSinceLastEvent = Math.floor((now.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysSinceLastEvent >= minDays && daysSinceLastEvent <= maxDays;
    });
  }
  
  return filteredParts;
}

// Get Single Part
export async function getPart(id: string) {
  const part = await prisma.part.findUnique({ 
    where: { id } 
  });
  
  if (!part) {
    throw new Error('Part not found');
  }
  
  return part;
}

// Get all unique locations
export async function getAllLocations(): Promise<string[]> {
  const parts = await prisma.part.findMany({
    select: { location: true },
    distinct: ['location'],
    orderBy: { location: 'asc' }
  });
  
  return parts.map(part => part.location).filter(Boolean);
}
