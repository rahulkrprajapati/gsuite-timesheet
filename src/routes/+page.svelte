<script>
	import { writable } from 'svelte/store';
	import DateRangePicker from '$lib/components/ui/DateRangePicker.svelte';
	import TimeSheet from '$lib/components/ui/TimeSheet.svelte';
	import StatsCard from '$lib/components/ui/StatsCard.svelte';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { fetchCalendarEvents } from '$lib/utils/googleCalendar.js';
	import InvoiceGenerator from '$lib/components/ui/InvoiceGenerator.svelte';
	import { improveDescription } from '$lib/utils/openai.js';
	import { convertToINR } from '$lib/utils/currencyConverter.js';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';

	let dateRange = null;
	let eventsPromise = writable(null);
	let hourlyRate = [40];
	let totalHours = 0;
	let totalBilledINR = 0;
	let currentUSDtoINR = 0;
	let currencyTimestamp = null;

	function handleRateChange(newRate) {
		currentUSDtoINR = parseFloat(newRate) || 0;
	}

	$: totalBilledINR = convertToINR(totalHours * hourlyRate[0], currentUSDtoINR);

	function parseDateTime(dateTimeObj) {
		if (dateTimeObj.dateTime) {
			return new Date(dateTimeObj.dateTime);
		} else if (dateTimeObj.date) {
			const date = new Date(dateTimeObj.date);
			date.setUTCHours(0, 0, 0, 0);
			return date;
		}
		return null;
	}

	$: progressColor = totalHours < 45 ? 'default' : totalHours < 65 ? 'orange' : 'red';

	function formatDateTime(date) {
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		});
	}

	function calculateDuration(event, start, end, isAllDay) {
		if (isAllDay) {
			if (event.eventType === 'workingLocation' || event.transparency === 'transparent') {
				return 0;
			} else {
				const oneDayMs = 24 * 60 * 60 * 1000;
				return (end.getTime() - start.getTime()) / oneDayMs;
			}
		} else {
			const diffMs = end.getTime() - start.getTime();
			return diffMs / (1000 * 60 * 60);
		}
	}

	async function fetchAndProcessEvents() {
		if (!dateRange?.original) {
			alert('Please select a date range first.');
			return;
		}

		eventsPromise.set(fetchEvents());
	}

	async function fetchEvents() {
		const rawEvents = await fetchCalendarEvents(dateRange?.original);
		const processedEvents = await Promise.all(
			rawEvents.map(async (event) => {
				const startDate = parseDateTime(event.start);
				const endDate = parseDateTime(event.end);
				const isAllDay = !event.start.dateTime && !event.end.dateTime;
				const duration =
					startDate && endDate ? calculateDuration(event, startDate, endDate, isAllDay) : 0;

				const attendees = event.attendees ? event.attendees.map((a) => a.email).join(', ') : '';
				const durationString = isAllDay ? 'All day' : `${duration.toFixed(2)} hours`;

				const improvedDesc = await improveDescription(
					event.summary,
					event.description,
					attendees,
					durationString
				);

				return {
					...event,
					startTime: startDate ? formatDateTime(startDate) : 'N/A',
					endTime: endDate ? formatDateTime(endDate) : 'N/A',
					duration: duration,
					isAllDay: isAllDay,
					description: improvedDesc
				};
			})
		);
		totalHours = processedEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
		return processedEvents;
	}
</script>

<main class="container mx-auto space-y-6 p-6 dark:bg-gray-950">
	<div class="mb-7 flex items-center justify-between">
		<div class="flex items-center space-x-5">
			<h1 class="text-3xl font-bold dark:text-white">Timesheet Generator</h1>
			<Badge
				variant="secondary"
				class="bg-[#A47EE726] px-3 py-1 text-xs font-semibold text-[#875BE1] hover:bg-[#A47EE726]"
			>
				Prototype
			</Badge>
		</div>
		<Button on:click={toggleMode} variant="outline" size="icon">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-lg p-4 shadow dark:bg-gray-900">
			<DateRangePicker on:daterange={(e) => (dateRange = e.detail)} />
			{#if dateRange?.formatted}
				<p class="mt-4 text-sm text-muted-foreground">
					Selected range: {dateRange?.formatted}
				</p>
			{/if}
			<Button on:click={fetchAndProcessEvents} class="mt-4">Fetch and Process</Button>
		</div>

		<div class="space-y-4 rounded-lg bg-white p-4 shadow dark:bg-gray-900">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<StatsCard
					title="Current USD to INR"
					value={`₹${currentUSDtoINR.toFixed(2)}`}
					change={currencyTimestamp ? `Updated: ${currencyTimestamp}` : 'Not updated'}
					progressValue={0}
					isCurrencyCard={true}
					onRateChange={handleRateChange}
				/>
				<StatsCard
					title="Total Billed (INR)"
					value={`₹${totalBilledINR.toFixed(2)}`}
					change={`${totalHours.toFixed(2)} hours @ $${hourlyRate[0]}/hr`}
					progressValue={totalHours}
					{progressColor}
				/>
			</div>

			<div>
				<label
					for="hourly-rate"
					class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
					>Hourly Rate ($)</label
				>
				<Slider id="hourly-rate" bind:value={hourlyRate} max={100} step={1} class="max-w-[70%]" />
			</div>
		</div>
	</div>

	<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
		<Tabs>
			<TabsList class="mb-4">
				<TabsTrigger value="timesheet">Timesheet</TabsTrigger>
				<TabsTrigger value="invoice">Invoice Generation</TabsTrigger>
			</TabsList>
			<TabsContent value="timesheet">
				{#if $eventsPromise}
					{#await $eventsPromise}
						<SkeletonLoader />
					{:then events}
						<TimeSheet {events} />
					{:catch error}
						<p class="text-red-500 dark:text-red-400">Error: {error.message}</p>
					{/await}
				{:else}
					<div
						class="rounded-lg bg-white p-4 text-center text-gray-500 shadow dark:bg-gray-700 dark:text-gray-300"
					>
						Please select a date range and click "Fetch and Process" to view the timesheet.
					</div>
				{/if}
			</TabsContent>
			<TabsContent value="invoice">
				<InvoiceGenerator totalAmount={totalBilledINR} />
			</TabsContent>
		</Tabs>
	</div>
</main>
