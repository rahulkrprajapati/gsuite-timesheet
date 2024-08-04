export async function fetchDefaultDetails() {
	const response = await fetch('/api/invoice-defaults');
	if (!response.ok) {
		throw new Error('Failed to fetch default invoice details');
	}
	return response.json();
}
