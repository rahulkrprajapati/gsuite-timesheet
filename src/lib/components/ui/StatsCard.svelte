<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { fetchCurrencyData } from '$lib/utils/currencyConverter.js';

	export let title;
	/**
	 * @type {string | number}
	 */
	 // @ts-ignore
	 export let value;
	export let change;
	export let progressValue;
	export let progressColor = 'default';
	export let isCurrencyCard = false;
	export let onRateChange = () => {};

	let useAPI = false;
	let manualRate = 0;
	/**
	 * @type {string | null}
	 */
	let timestamp = null;
	/**
	 * @type {number | null}
	 */
	let cachedRate = null;
	/**
	 * @type {string | number | Date | null}
	 */
	let cachedTimestamp = null;

	async function loadCachedData() {
		const data = await fetchCurrencyData();
		cachedRate = data.currentRate;
		cachedTimestamp = data.timestamp;
		if (useAPI) {
			// @ts-ignore
			value = `₹${cachedRate.toFixed(3)}`;
			// @ts-ignore
			timestamp = new Date(cachedTimestamp).toLocaleString();
			// @ts-ignore
			onRateChange(cachedRate);
		}
	}

// @ts-ignore
		$: if (useAPI) {
		loadCachedData();
	}

	onMount(() => {
		loadCachedData();
	});

	async function fetchLatestRate() {
		const data = await fetchCurrencyData();
		if (data.currentRate) {
			value = `₹${data.currentRate.toFixed(3)}`;
			timestamp = new Date(data.timestamp).toLocaleString();
			// @ts-ignore
			onRateChange(data.currentRate); // Add this line
			toast.success('Currency rate updated', {
				description: `New rate: ${value}`
			});
		} else {
			toast.error('Failed to fetch latest rate');
		}
	}

// @ts-ignore
		$: if (isCurrencyCard && !useAPI) {
		// @ts-ignore
		const rateValue = parseFloat(manualRate) || 0;
		value = rateValue;
		// @ts-ignore
		onRateChange(rateValue);
	}

	/**
	 * @param {{ target: { value: any; }; }} event
	 */
	function handleManualRateInput(event) {
		const inputValue = event.target.value;
		if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
			manualRate = inputValue;
			const numericValue = parseFloat(inputValue) || 0;
			if (!useAPI) {
				value = `₹${numericValue.toFixed(3)}`;
				// @ts-ignore
				onRateChange(numericValue);
			}
		}
	}
</script>

<Card.Root>
	<Card.Header class="pb-2">
		<Card.Description>{title}</Card.Description>
		<Card.Title class="text-3xl">
			{#if typeof value === 'number'}
				₹{value.toFixed(3)}
			{:else}
				{value}
			{/if}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="text-xs text-muted-foreground">{change}</div>
		{#if isCurrencyCard}
			<div class="mt-2 flex items-center space-x-2">
				<Switch id="use-api" bind:checked={useAPI} />
				<Label for="use-api">Use API</Label>
			</div>
			{#if useAPI}
				<div class="mt-2">
					<Button on:click={fetchLatestRate}>Fetch Latest Rate</Button>
					{#if timestamp}
						<p class="mt-1 text-xs">Last updated: {timestamp}</p>
					{/if}
				</div>
			{:else}
				<div class="mt-2">
					<Input
						type="text"
						bind:value={manualRate}
						on:input={handleManualRateInput}
						placeholder="Enter rate manually"
						pattern="^\d*\.?\d*$"
						inputmode="decimal"
						step="any"
					/>
				</div>
			{/if}
			{#if cachedRate && cachedTimestamp}
				<p class="mt-4 text-xs text-muted-foreground">
					<span class="mb-1 block">Cached rate: ₹{cachedRate.toFixed(3)}</span>
					<span class="block">(as of {new Date(cachedTimestamp).toLocaleString()})</span>
				</p>
			{/if}
		{/if}
	</Card.Content>
	<Card.Footer>
		{#if !isCurrencyCard}
			<Progress
				value={progressValue}
				aria-label="{change} increase"
				class={progressColor === 'orange'
					? 'bg-orange-500'
					: progressColor === 'red'
						? 'bg-red-500'
						: ''}
			/>
		{/if}
	</Card.Footer>
</Card.Root>
