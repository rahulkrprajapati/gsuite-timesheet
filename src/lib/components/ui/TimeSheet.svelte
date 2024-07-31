<script>
    import * as Table from '$lib/components/ui/table/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import { Clock, Calendar, FileSpreadsheet, User, UserCircle } from 'lucide-svelte';
    import * as XLSX from 'xlsx';

    export let events = [];

    const columns = [
        { key: 'startTime', header: 'Start Time', icon: Clock },
        { key: 'endTime', header: 'End Time', icon: Clock },
        { key: 'duration', header: 'Duration (hours)' },
        { key: 'description', header: 'Description' },
        { key: 'creator', header: 'Creator', iconFunc: (event) => event.creator.self ? UserCircle : User }
    ];

    function getIconText(IconComponent) {
        if (IconComponent === Clock) return '🕒';
        if (IconComponent === Calendar) return '📅';
        if (IconComponent === User) return '👤';
        if (IconComponent === UserCircle) return '🧑';
        return '';
    }

    function downloadExcel() {
        const dataToDownload = events.map(event => {
            const rowData = {};
            columns.forEach(column => {
                let iconText = '';
                if (column.icon) {
                    iconText = getIconText(column.icon);
                } else if (column.iconFunc) {
                    iconText = getIconText(column.iconFunc(event));
                }
                
                let value = column.key === 'creator' ? event.creator.email : event[column.key];
                rowData[column.header] = `${iconText} ${value}`.trim();
            });
            return rowData;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Timesheet');
        XLSX.writeFile(workbook, 'timesheet.xlsx');
    }

    function formatDescription(description) {
        return description.replace(/\n/g, '<br>').replace(/- /g, '• ');
    }
</script>

{#if events.length > 0}
    <Table.Root>
        <Table.Header>
            <Table.Row>
                {#each columns as column}
                    <Table.Head>{column.header}</Table.Head>
                {/each}
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each events as event}
                <Table.Row>
                    {#each columns as column}
                        <Table.Cell>
                            {#if column.icon}
                                <svelte:component this={column.icon} class="mr-2 inline" />
                            {:else if column.iconFunc}
                                <svelte:component this={column.iconFunc(event)} class="mr-2 inline" />
                            {/if}
                            {#if column.key === 'description'}
                                {@html formatDescription(event[column.key])}
                            {:else if column.key === 'creator'}
                                {event.creator.email}
                            {:else}
                                {event[column.key]}
                            {/if}
                        </Table.Cell>
                    {/each}
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>

    <div class="mt-4">
        <Button on:click={downloadExcel}>
            <FileSpreadsheet class="mr-2" />
            Download Excel
        </Button>
    </div>
{:else}
    <p>No events found for the selected date range.</p>
{/if}