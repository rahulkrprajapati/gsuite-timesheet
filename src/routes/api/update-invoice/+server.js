import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function POST({ request }) {
  try {
    const updatedData = await request.json();
    const filePath = path.join(process.cwd(), 'src', 'lib', 'data', 'invoice-defaults.json');
    
    // Read existing data
    const existingData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    
    // Merge updated data with existing data
    const mergedData = { ...existingData, ...updatedData };
    
    // Write merged data back to file
    await fs.writeFile(filePath, JSON.stringify(mergedData, null, 2));
    
    return json({ success: true });
  } catch (error) {
    console.error('Error updating invoice data:', error);
    return json({ error: 'Failed to update invoice data' }, { status: 500 });
  }
}