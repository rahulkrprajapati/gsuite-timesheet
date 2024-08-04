<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	import { Label } from '$lib/components/ui/label/index.js';
	import { fetchDefaultDetails } from '$lib/utils/invoiceUtils.js';

	export let totalAmount = 0;
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let calendarValue;

	$: {
		if ($invoiceData.date) {
			calendarValue = parseDate($invoiceData.date);
		} else {
			calendarValue = today(getLocalTimeZone());
			$invoiceData.date = calendarValue.toString().split('T')[0];
		}
	}

	function updateInvoiceDate(newValue) {
		calendarValue = newValue;
		$invoiceData.date = newValue.toString().split('T')[0];
	}

	let invoiceData = writable({
		invoiceNumber: generateInvoiceNumber(),
		date: new Date().toISOString().split('T')[0],
		from: {
			name: '',
			address: ''
		},
		to: {
			name: '',
			address: '',
			taxId: ''
		},
		items: [{ description: 'AI Consultant', amount: totalAmount }],
		bankDetails: {
			name: '',
			accountNo: '',
			bank: '',
			branch: '',
			ifsc: '',
			pan: '',
			email: ''
		}
	});

	let drawerOpen = false;

	onMount(async () => {
		const defaultDetails = await fetchDefaultDetails();
		invoiceData.set({ ...$invoiceData, ...defaultDetails });
	});

	$: $invoiceData.items[0].amount = totalAmount;

	function addItem() {
		$invoiceData.items = [...$invoiceData.items, { description: '', amount: 0 }];
	}

	function removeItem(index) {
		$invoiceData.items = $invoiceData.items.filter((_, i) => i !== index);
	}

	async function saveChanges() {
		try {
			const response = await fetch('/api/update-invoice', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify($invoiceData)
			});

			if (!response.ok) {
				throw new Error('Failed to save invoice data');
			}

			drawerOpen = false;
		} catch (error) {
			console.error('Error saving invoice data:', error);
			alert('Failed to save changes. Please try again.');
		}
	}

	async function downloadPDF() {
		try {
			const response = await fetch('/api/generate-pdf', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify($invoiceData)
			});

			if (!response.ok) {
				throw new Error('Failed to generate PDF');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = `invoice_${$invoiceData.invoiceNumber}.pdf`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading PDF:', error);
			alert('Failed to download PDF. Please try again.');
		}
	}

	async function downloadDOCX() {
		try {
			const response = await fetch('/api/generate-docx', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify($invoiceData)
			});

			if (!response.ok) {
				throw new Error('Failed to generate DOCX');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = `invoice_${$invoiceData.invoiceNumber}.docx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading DOCX:', error);
			alert('Failed to download DOCX. Please try again.');
		}
	}
	function generateInvoiceNumber() {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const randomNum = Math.floor(Math.random() * 1000)
			.toString()
			.padStart(3, '0');
		return `INV-${year}${month}${day}-${randomNum}`;
	}
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	style="font-family: 'Nunito Sans', sans-serif;"
	class="container mx-auto space-y-6 p-6 dark:bg-gray-950"
>
	<div class="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-md dark:bg-gray-900">
		<h1 class="mb-6 text-3xl font-bold dark:text-white">Invoice</h1>

		<div class="mb-6 flex justify-between">
			<div>
				<h2 class="text-lg font-semibold dark:text-white">From</h2>
				<p class="dark:text-gray-300">{$invoiceData.from.name}</p>
				<p class="whitespace-pre-line dark:text-gray-300">{$invoiceData.from.address}</p>
			</div>
			<div class="text-right">
				<p class="dark:text-gray-300">
					<span class="font-semibold dark:text-white">Invoice No:</span>
					{$invoiceData.invoiceNumber}
				</p>
				<p class="dark:text-gray-300">
					<span class="font-semibold dark:text-white">Date:</span>
					{$invoiceData.date}
				</p>
			</div>
		</div>

		<div class="mb-6">
			<h2 class="text-lg font-semibold dark:text-white">To</h2>
			<p class="dark:text-gray-300">{$invoiceData.to.name}</p>
			<p class="whitespace-pre-line dark:text-gray-300">{$invoiceData.to.address}</p>
			<p class="dark:text-gray-300">Tax ID: {$invoiceData.to.taxId}</p>
		</div>

		<table class="mb-6 w-full">
			<thead>
				<tr class="border-b dark:border-gray-700">
					<th class="py-2 text-left dark:text-white">Description</th>
					<th class="py-2 text-right dark:text-white">Amount</th>
				</tr>
			</thead>
			<tbody>
				{#each $invoiceData.items as item}
					<tr class="border-b dark:border-gray-700">
						<td class="py-2 dark:text-gray-300">{item.description}</td>
						<td class="py-2 text-right dark:text-gray-300">INR {item.amount.toLocaleString()}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr class="font-semibold">
					<td class="py-2 dark:text-white">Total</td>
					<td class="py-2 text-right dark:text-white">
						INR {$invoiceData.items
							.reduce((sum, item) => sum + Number(item.amount), 0)
							.toLocaleString()}
					</td>
				</tr>
			</tfoot>
		</table>

		<div class="mb-6">
			<h2 class="mb-2 text-lg font-semibold dark:text-white">Invoice Note</h2>
			<p class="dark:text-gray-300">
				<span class="font-semibold dark:text-white">Name:</span>
				{$invoiceData.bankDetails.name}
			</p>
			<p class="dark:text-gray-300">
				<span class="font-semibold dark:text-white">Account No:</span>
				{$invoiceData.bankDetails.accountNo}
			</p>
			<p class="dark:text-gray-300">
				<span class="font-semibold dark:text-white">Bank:</span>
				{$invoiceData.bankDetails.bank}
			</p>
			<p class="dark:text-gray-300">
				<span class="font-semibold dark:text-white">Branch:</span>
				{$invoiceData.bankDetails.branch}
			</p>
			<p class="dark:text-gray-300">
				<span class="font-semibold dark:text-white">IFSC:</span>
				{$invoiceData.bankDetails.ifsc}
			</p>
			<p class="dark:text-gray-300">
				<span class="font-semibold dark:text-white">PAN no:</span>
				{$invoiceData.bankDetails.pan}
			</p>
			<p class="dark:text-gray-300">
				<span class="font-semibold dark:text-white">Email:</span>
				{$invoiceData.bankDetails.email}
			</p>
		</div>

		<div class="flex space-x-4">
			<Button on:click={() => (drawerOpen = true)}>Edit</Button>
			<Button on:click={downloadPDF}>Download PDF</Button>
			<Button on:click={downloadDOCX}>Download DOCX</Button>
		</div>
	</div>
</div>

<Drawer.Root bind:open={drawerOpen}>
	<Drawer.Content
		style="font-family: 'Nunito Sans', sans-serif;"
		class="mx-auto flex h-[50vh] max-w-2xl flex-col dark:bg-gray-900"
	>
		<Drawer.Header class="flex-shrink-0">
			<Drawer.Title class="dark:text-white">Edit Invoice</Drawer.Title>
		</Drawer.Header>
		<div class="flex-grow overflow-y-auto p-4">
			<Accordion.Root class="w-full">
				<Accordion.Item value="invoice-details">
					<Accordion.Trigger>Invoice Details</Accordion.Trigger>
					<Accordion.Content>
						<div class="grid grid-cols-2 gap-4">
							<Label class="dark:text-gray-300">
								Invoice Number:
								<Input
									type="text"
									bind:value={$invoiceData.invoiceNumber}
									class="mt-1 w-full dark:bg-gray-800 dark:text-white"
									readonly
								/>
							</Label>
							<Button
								on:click={() => ($invoiceData.invoiceNumber = generateInvoiceNumber())}
								class="self-end"
							>
								Generate New Number
							</Button>
							<Label class="dark:text-gray-300">
								Date:
								<Popover.Root>
									<Popover.Trigger asChild let:builder>
										<Button
											variant="outline"
											class={cn(
												'w-[280px] justify-start text-left font-normal dark:bg-gray-800 dark:text-white',
												!calendarValue && 'text-muted-foreground'
											)}
											builders={[builder]}
										>
											<CalendarIcon class="mr-2 h-4 w-4" />
											{calendarValue
												? df.format(calendarValue.toDate(getLocalTimeZone()))
												: 'Pick a date'}
										</Button>
									</Popover.Trigger>
									<Popover.Content class="w-auto p-0">
										<Calendar
											value={calendarValue}
											onValueChange={updateInvoiceDate}
											initialFocus
										/>
									</Popover.Content>
								</Popover.Root>
							</Label>
						</div>
					</Accordion.Content>
				</Accordion.Item>

				<Accordion.Item value="from-details">
					<Accordion.Trigger>From</Accordion.Trigger>
					<Accordion.Content>
						<Label class="mb-2 block dark:text-gray-300">
							Name:
							<Input
								type="text"
								bind:value={$invoiceData.from.name}
								class="mt-1 w-full dark:bg-gray-800 dark:text-white"
							/>
						</Label>
						<Label class="mb-2 block dark:text-gray-300">
							Address:
							<Textarea
								bind:value={$invoiceData.from.address}
								class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								rows="3"
							></Textarea>
						</Label>
					</Accordion.Content>
				</Accordion.Item>

				<Accordion.Item value="to-details">
					<Accordion.Trigger>To</Accordion.Trigger>
					<Accordion.Content>
						<div class="mb-2 grid grid-cols-2 gap-4">
							<Label class="dark:text-gray-300">
								Name:
								<Input
									type="text"
									bind:value={$invoiceData.to.name}
									class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								/>
							</Label>
							<Label class="dark:text-gray-300">
								Tax ID:
								<Input
									type="text"
									bind:value={$invoiceData.to.taxId}
									class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								/>
							</Label>
						</div>
						<Label class="block dark:text-gray-300">
							Address:
							<Textarea
								bind:value={$invoiceData.to.address}
								class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								rows="3"
							></Textarea>
						</Label>
					</Accordion.Content>
				</Accordion.Item>

				<Accordion.Item value="invoice-items">
					<Accordion.Trigger>Invoice Items</Accordion.Trigger>
					<Accordion.Content>
						{#each $invoiceData.items as item, index}
							<div class="mb-4 rounded border p-4 dark:border-gray-700">
								<Label class="mb-2 block dark:text-gray-300">
									Description:
									<Input
										type="text"
										bind:value={item.description}
										class="mt-1 w-full dark:bg-gray-800 dark:text-white"
									/>
								</Label>
								<Label class="mb-2 block dark:text-gray-300">
									Amount:
									<Input
										type="number"
										bind:value={item.amount}
										class="mt-1 w-full dark:bg-gray-800 dark:text-white"
									/>
								</Label>
								{#if index !== 0}
									<Button
										on:click={() => removeItem(index)}
										class="mt-2 bg-[#D97757] text-white hover:bg-[#C86646] dark:bg-[#D97757] dark:text-white dark:hover:bg-[#C86646]"
									>
										Remove
									</Button>
								{/if}
							</div>
						{/each}
						<Button
							on:click={addItem}
							variant="outline"
							class="mt-2 bg-[#D97757] text-white hover:bg-[#C86646] dark:bg-[#D97757] dark:text-white dark:hover:bg-[#C86646]"
							>Add Item</Button
						>
					</Accordion.Content>
				</Accordion.Item>

				<Accordion.Item value="bank-details">
					<Accordion.Trigger>Bank Details</Accordion.Trigger>
					<Accordion.Content>
						<div class="grid grid-cols-2 gap-4">
							<Label class="dark:text-gray-300">
								Name:
								<Input
									type="text"
									bind:value={$invoiceData.bankDetails.name}
									class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								/>
							</Label>
							<Label class="dark:text-gray-300">
								Account No:
								<Input
									type="text"
									bind:value={$invoiceData.bankDetails.accountNo}
									class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								/>
							</Label>
							<Label class="dark:text-gray-300">
								Bank:
								<Input
									type="text"
									bind:value={$invoiceData.bankDetails.bank}
									class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								/>
							</Label>
							<Label class="dark:text-gray-300">
								IFSC:
								<Input
									type="text"
									bind:value={$invoiceData.bankDetails.ifsc}
									class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								/>
							</Label>
							<Label class="dark:text-gray-300">
								PAN:
								<Input
									type="text"
									bind:value={$invoiceData.bankDetails.pan}
									class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								/>
							</Label>
							<Label class="dark:text-gray-300">
								Email:
								<Input
									type="email"
									bind:value={$invoiceData.bankDetails.email}
									class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								/>
							</Label>
						</div>
						<Label class="mt-4 block dark:text-gray-300">
							Branch:
							<Textarea
								bind:value={$invoiceData.bankDetails.branch}
								class="mt-1 w-full dark:bg-gray-800 dark:text-white"
								rows="2"
							></Textarea>
						</Label>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
		<Drawer.Footer class="flex-shrink-0">
			<Button on:click={saveChanges}>Save Changes</Button>
			<Drawer.Close asChild let:builder>
				<Button builders={[builder]} variant="outline">Cancel</Button>
			</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
