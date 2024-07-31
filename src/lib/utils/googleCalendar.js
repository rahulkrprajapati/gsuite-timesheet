/**
 * @param {{ start: { toDate: () => { (): any; new (): any; toISOString: { (): any; new (): any; }; }; }; end: { toDate: () => { (): any; new (): any; toISOString: { (): any; new (): any; }; }; }; }} dateRange
 */
export async function fetchCalendarEvents(dateRange) {
    try {
      const response = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: dateRange.start.toDate().toISOString(),
          end: dateRange.end.toDate().toISOString(),
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }