<script>
    import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
    /**
	 * @type {any}
	 */
    let value;
  
    $: if (value) {
      dispatch('daterange', value);
    }
  </script>
  
  <RangeCalendar bind:value class="rounded-md border" />