<script>
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import { createEventDispatcher } from 'svelte';
	import { getLocalTimeZone } from '@internationalized/date';

	const dispatch = createEventDispatcher();

	/**
	 * @type {any}
	 */
	let value;

	/**
	 * @param {{ toDate: (arg0: string) => any; }} date
	 */
	function formatDate(date) {
		if (!date) return '';
		const jsDate = date.toDate(getLocalTimeZone());
		return jsDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	/**
	 * @param {any} start
	 * @param {{ compare: (arg0: any) => number; }} end
	 */
	function calculateDuration(start, end) {
		if (!start || !end) return 0;
		return end.compare(start) + 1;
	}

	$: if (value && value.start && value.end) {
		const start = formatDate(value.start);
		const end = formatDate(value.end);
		const duration = calculateDuration(value.start, value.end);
		const formattedRange = `${start} - ${end} (${duration} days)`;

		dispatch('daterange', {
			original: value,
			formatted: formattedRange
		});
	}
</script>

<RangeCalendar bind:value class="rounded-md border shadow dark:bg-gray-950" />
