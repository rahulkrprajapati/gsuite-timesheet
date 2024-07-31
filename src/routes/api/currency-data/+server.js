import { EXCHANGE_RATE_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://v6.exchangerate-api.com/v6';
const CACHE_FILE = path.join(process.cwd(), 'currency-cache.json');

async function readCache() {
	try {
		const data = await fs.readFile(CACHE_FILE, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		return null;
	}
}

async function writeCache(data) {
	await fs.writeFile(CACHE_FILE, JSON.stringify(data));
}

export async function GET() {
	try {
		const cachedData = await readCache();

		// If cached data exists and is less than 1 hour old, return it
		if (cachedData && Date.now() - new Date(cachedData.timestamp).getTime() < 3600000) {
			return json(cachedData);
		}

		const latestResponse = await fetch(`${BASE_URL}/${EXCHANGE_RATE_API_KEY}/latest/USD`);
		const latestData = await latestResponse.json();

		if (latestData.result !== 'success') {
			throw new Error(latestData['error-type'] || 'Failed to fetch latest exchange rate');
		}

		const currentRate = latestData.conversion_rates.INR;
		const timestamp = new Date().toISOString();

		const responseData = { currentRate, timestamp };
		await writeCache(responseData);

		return json(responseData);
	} catch (error) {
		console.error('Error fetching currency data:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
