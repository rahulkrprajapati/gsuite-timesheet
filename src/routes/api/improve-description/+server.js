import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

const client = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export async function POST({ request }) {
	const { summary, description, attendees, duration } = await request.json();
	if (duration === 0 || duration === 'All day') {
		return json({ improvedDescription: 'NA' });
	}
	const attendeesPrompt = attendees ? `Attendees: ${attendees}` : '';

	try {
		const response = await client.chat.completions.create({
			model: 'gpt-4-0125-preview',
			messages: [
				{
					role: 'system',
					content:
						'You are an AI assistant helping a Lead AI Engineer automatically create timesheet entries from their Google Calendar events. Provide concise, first-person summaries for work-related events, and brief notes for personal events.'
				},
				{
					role: 'user',
					content: `Summarize the following calendar event for my timesheet as a Lead AI Engineer:
        Summary: ${summary}
        Description: ${description}
        ${attendeesPrompt}
        Duration: ${duration}
        
        For work events, use this format:
        Event: [Event Name]; (Duration)
        Objective: [Brief objective of the event from my perspective]
        My Focus:
        • [Bullet point 1 about what I need to do or prepare]
        • [Bullet point 2 about my role or expectations]
        • [Bullet point 3 if necessary]

        Notes:
        - If it's a Zoom call, mention it's a virtual meeting but don't include full Zoom details.
        - Prioritize information relevant to my AI engineering tasks or leadership responsibilities.
        - Keep the summary concise and action-oriented from my point of view.
        - Only include attendees if they are relevant to my role in the event.
        - If no substantial information is available, keep the summary brief but from my perspective.
        - For undefined or vague events, focus on potential preparations or follow-ups I might need.`
				}
			],
			max_tokens: 150
		});

		return json({ improvedDescription: response.choices[0].message.content.trim() });
	} catch (error) {
		console.error('Error improving description:', error);
		return json({ improvedDescription: description }, { status: 500 });
	}
}
