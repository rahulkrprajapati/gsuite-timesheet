export async function fetchCurrencyData() {
	try {
		const response = await fetch('/api/currency-data');
		if (!response.ok) {
			throw new Error('Failed to fetch currency data');
		}
		const data = await response.json();
		if (data.error) {
			throw new Error(data.error);
		}
		return data;
	} catch (error) {
		console.error('Error fetching currency data:', error);
		return { currentRate: 0, timestamp: null };
	}
}

/**
 * @param {number} usdAmount
 * @param {number} exchangeRate
 */
export function convertToINR(usdAmount, exchangeRate) {
	return usdAmount * exchangeRate;
}
