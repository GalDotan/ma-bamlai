// File: src/app/actions/partActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

// Create Part
export async function createPart(form: FormData) {  // Pull every field off the FormData and coerce to string
  const name       = form.get('name')?.toString()       ?? '';
  const partType   = form.get('partType')?.toString()   ?? ''; // Updated field name
  const typt       = form.get('typt')?.toString()       ?? ''; // New field
  const yearStr    = form.get('year')?.toString();
  const details    = form.get('details')?.toString()    || '';  // Make details optional but default to empty string
  const quantityStr= form.get('quantity')?.toString();
  const location   = form.get('location')?.toString()   ?? '';
  const link       = form.get('link')?.toString()       ?? ''; // Ensure link is included
  // Basic server‐side check
  if (!name || !partType || yearStr === undefined || quantityStr === undefined || !link) {
    throw new Error('Missing required fields: name, partType, year, quantity, or link');
  }
  const year     = parseInt(yearStr, 10);
  const quantity = parseInt(quantityStr, 10);

  // Create initial location history entry
  // (Removed unused initialLocationHistory variable)

  // Find the current max partNumber
  // If you want to use partNumber, ensure it exists in your Prisma schema and migrate your database.
  // Otherwise, remove this logic or use another unique field.
  // For now, we'll remove this logic to fix the error:

  // const maxPart = await prisma.part.findFirst({
  //   orderBy: { partNumber: 'desc' },
  //   select: { partNumber: true },
  // });
  // const nextPartNumber = maxPart?.partNumber ? maxPart.partNumber + 1 : 1;

  // Find the current max partNumber
  const maxPart = await prisma.part.findFirst({
    orderBy: { partNumber: 'desc' },
    select: { partNumber: true },
  });
  const nextPartNumber = maxPart?.partNumber ? maxPart.partNumber + 1 : 1;

  await prisma.part.create({
    data: {
      name,
      partType, // Updated field name
      typt,     // New field
      year,      details,
      quantity,
      link, // Added link field
      location, // Add location field
      quantityHistory: [
        {
          date: new Date().toISOString(),
          prev: 0,
          new: quantity
        }
      ],
      locationHistory: [
        {
          date: new Date().toISOString(),
          from: null,
          to: location
        }
      ],
      eventsHistory: [],
      partNumber: nextPartNumber, // Add short sequential part number
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
  if (!part) throw new Error('Part not found');  const locationHistory = Array.isArray(part.locationHistory) ? part.locationHistory as { date: string; from: string | null; to: string }[] : [];
  locationHistory.push({
    date: new Date().toISOString(),
    from: part.location,
    to: newLocation
  });
  await prisma.part.update({
    where: { id },
    data: { location: newLocation, locationHistory }
  });
  
  revalidatePath('/parts');
  revalidatePath(`/parts/${id}`);
}

// Add Event (components only)
export async function addEvent(form: FormData) {
  const id = form.get('id')?.toString() ?? '';
  const description = form.get('description')?.toString() ?? '';
  const technician = form.get('technician')?.toString() ?? '';
  if (!id || !description || !technician) throw new Error('Missing event data');
  const part = await prisma.part.findUnique({
    where: { id },
    select: { eventsHistory: true }
  });
  if (!part) throw new Error('Part not found');
  const eventsHistory = Array.isArray(part.eventsHistory) ? part.eventsHistory as { date: string; description: string; technician: string }[] : [];
  eventsHistory.push({
    date: new Date().toISOString(),
    description,
    technician
  });
  await prisma.part.update({
    where: { id },
    data: { eventsHistory }
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
  const quantityHistory = Array.isArray(part.quantityHistory) ? part.quantityHistory as { date: string; prev: number; new: number }[] : [];
  quantityHistory.push({
    date: new Date().toISOString(),
    prev: part.quantity,
    new: newQty
  });
  await prisma.part.update({
    where: { id },
    data: { quantity: newQty, quantityHistory }
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
  const where: Record<string, unknown> = {};
  
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
  let orderBy: Record<string, unknown> = { name: 'asc' }; // default
  
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
      const events = Array.isArray(part.eventsHistory) ? part.eventsHistory as { date: string }[] : [];
      if (events.length === 0) {
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

// Find Part by Part Number (for barcode scanning)
export async function getPartByPartNumber(partNumber: number) {
  const part = await prisma.part.findFirst({
    where: {
      partNumber: partNumber
    }
  });
  
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
