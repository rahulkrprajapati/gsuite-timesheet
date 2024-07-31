export async function improveDescription(summary, description, attendees, duration) {
  try {
    const response = await fetch('/api/improve-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary, description, attendees, duration }),
    });

    if (!response.ok) {
      throw new Error('Failed to improve description');
    }

    const data = await response.json();
    return data.improvedDescription;
  } catch (error) {
    console.error('Error improving description:', error);
    return `${summary}\n${description}`; // Return original summary and description if there's an error
  }
}