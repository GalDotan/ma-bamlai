# Google Sheets Inventory Import

This script imports your Google Sheets inventory data into the database.

## Quick Steps

1. **Export your Google Sheet as CSV:**
   - Open your Google Sheet
   - Go to File → Download → Comma-separated values (.csv)
   - Save as `inventory.csv`

2. **Place the CSV file:**
   - Put `inventory.csv` in the `scripts` folder

3. **Run the import:**

   For standard import (if your database schema matches Prisma schema):
   ```powershell
   cd scripts
   node import_inventory_final.js
   ```

   For advanced import (handles schema mismatches):
   ```powershell
   cd scripts
   node import_inventory_advanced.js
   ```

   For direct MongoDB import (bypasses Prisma entirely):
   ```powershell
   cd scripts
   node import_inventory_mongodb.js
   ```

## Expected CSV Format

Your CSV should have these columns:
- `Part Number` - Original part identifier (will be replaced with new unique IDs)
- `Name` - The part name/description
- `Part Type` - Either "Component" or "Consumable"
- `Year` - Year (optional for components, required for consumables)
- `Location` - Where the part is stored
- `Quantity` - Quantity (for consumables)
- `Link` - URL (optional)
- `Typt` - Part category/type (optional)

## Features

- ✅ Handles quoted fields in CSV (e.g., commas in names)
- ✅ Auto-corrects "Concumable" typo to "Consumable"
- ✅ Generates new unique part numbers to prevent conflicts
- ✅ Uses advanced methods to bypass database constraints
- ✅ Creates proper history entries
- ✅ Provides detailed import statistics

## Troubleshooting

If you encounter issues:

1. **CSV format problems:**
   - Make sure you have all required columns
   - Check for special characters or quotes in the data

2. **Database errors:**
   - If you see unique constraint errors related to `barcode`, try the advanced script
   - The script includes special handling for database-specific constraints

3. **Missing fields:**
   - All parts must have a part number, name, and part type
   - Consumables should have a quantity

4. **Part Number Mapping:**
   - The script creates a `part_number_mapping.json` file showing original and new part numbers
   - Use this file to reference the new part numbers in the system

5. **Database Schema:**
   - If you continue to have issues, the database schema may need to be updated
   - Run a Prisma migration to align the database schema with your Prisma schema
