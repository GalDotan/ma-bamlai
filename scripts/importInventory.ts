import fs from 'fs';
import csv from 'csv-parser';
import { prisma } from '@/lib/prisma'; // Adjust if needed

async function run() {
  const results: any[] = [];

  fs.createReadStream('inventory_cleaned.csv') // Update path if needed
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const item of results) {
        const partName = item["name"]?.trim();

        // Skip if name is missing
        if (!partName) {
          console.log('⚠️ Skipped: Part without name');
          continue;
        }

        const location = item["location"]?.trim() || "Unknown";

        try {
          await prisma.part.create({
            data: {
              name: partName,
              partType: item["partType"]?.trim() || "Consumable",
              year: parseInt(item["year"]) || 0,
              details: null,
              partNumber: parseInt(item["partNumber"]),
              quantity: parseInt(item["quantity"]) || 0,
              quantityHistory: [],
              location,
              locationHistory: [
                {
                  date: new Date().toISOString(),
                  from: null,
                  to: location,
                }
              ],
              eventsHistory: [],
              link: item["link"]?.trim() || "",
              typt: item["typt"]?.trim() || "",
            },
          });

          console.log(`✅ Imported: ${partName}`);
        } catch (err) {
          console.error(`❌ Failed to import ${partName}:`, err);
        }
      }

      console.log('🚀 Import completed.');
      process.exit();
    });
}

run().catch((e) => {
  console.error('❌ Script error:', e);
  process.exit(1);
});
