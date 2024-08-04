import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'data', 'invoice-defaults.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const defaults = JSON.parse(data);
    return json(defaults);
  } catch (error) {
    console.error('Error reading invoice defaults:', error);
    return json({ error: 'Failed to read invoice defaults' }, { status: 500 });
  }
}