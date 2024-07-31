import { EXCHANGE_RATE_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

const BASE_URL = 'https://v6.exchangerate-api.com/v6';

export async function GET() {
  try {
    // Fetch current exchange rate
    const latestResponse = await fetch(`${BASE_URL}/${EXCHANGE_RATE_API_KEY}/latest/USD`);
    const latestData = await latestResponse.json();

    if (latestData.result !== 'success') {
      throw new Error(latestData['error-type'] || 'Failed to fetch latest exchange rate');
    }

    const currentRate = latestData.conversion_rates.INR;

    // Fetch historical data for the past week
    const historicalData = await fetchHistoricalData();

    return json({
      currentRate,
      historicalData
    });
  } catch (error) {
    console.error('Error fetching currency data:', error);
    return json({ error: error.message }, { status: 500 });
  }
}

// TODO: Change the function as this requires more api calls and also doesn't work on free tier
async function fetchHistoricalData() {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  /**
   * @type {never[]}
   */
  const historicalData = [];

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // getMonth() returns 0-11
    const day = d.getDate();

    // const response = await fetch(`${BASE_URL}/${EXCHANGE_RATE_API_KEY}/history/USD/${year}/${month}/${day}`);
    // const data = await response.json();
    // console.log(data)
    // if (data.result === 'success') {
    //   historicalData.push({
    //     date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    //     rate: data.conversion_rates.INR
    //   });
    // }
  }

  return historicalData;
}