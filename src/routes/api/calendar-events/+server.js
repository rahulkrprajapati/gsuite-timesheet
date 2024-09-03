import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import { json } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
	try {
		const content = await fs.readFile(TOKEN_PATH);
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials);
	} catch (err) {
		return null;
	}
}

async function saveCredentials(client) {
	const content = await fs.readFile(CREDENTIALS_PATH);
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: 'authorized_user',
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token
	});
	await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
	let client = await loadSavedCredentialsIfExist();
	if (client) {
		return client;
	}
	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH
	});
	if (client.credentials) {
		await saveCredentials(client);
	}
	return client;
}

export async function POST({ request }) {
  const { start, end } = await request.json();

  try {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: start,
      timeMax: end,
      singleEvents: true,
      orderBy: 'startTime',
      showDeleted: false,
      maxResults: 2500,
      timeZone: 'UTC'
    });

    const allEvents = res.data.items
      .filter(event => event.status !== 'cancelled')
      .map(event => ({
        kind: event.kind,
        etag: event.etag,
        id: event.id,
        status: event.status,
        htmlLink: event.htmlLink,
        created: event.created,
        updated: event.updated,
        summary: event.summary,
        description: event.description,
        creator: event.creator,
        organizer: event.organizer,
        start: event.start,
        end: event.end,
        recurringEventId: event.recurringEventId,
        originalStartTime: event.originalStartTime,
        transparency: event.transparency,
        visibility: event.visibility,
        iCalUID: event.iCalUID,
        sequence: event.sequence,
        reminders: event.reminders,
        workingLocationProperties: event.workingLocationProperties,
        eventType: event.eventType || 'default',
        attendees: event.attendees || [],
        location: event.location
      }));

    return json(allEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}