<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Button } from '$lib/components/ui/button';

	////////////////////////////////////////////////////////////////

	let { openSheet, card } = $props();
</script>

<Button
			class="flex h-fit w-full flex-col space-y-2 p-4 hover:border hover:border-dashed hover:border-gray-500"
	onclick={() => {
		openSheet(card);
	}}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md font-bold text-slate-400">
			{card.Title || 'Select date from here'}
			{#if card.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</h1>
	</div>
	<div class="h-fit w-full rounded p-2">
		<div class="flex items-start justify-start py-2 font-serif text-sm text-slate-500">
			<!-- <Input type="date" id="option1" name="options" disabled /> -->
			<div class="w-full rounded-md border bg-slate-50 py-2 pl-2 pr-10 text-left text-slate-400">
				<p class="text-sm">Enter date here</p>
			</div>
		</div>
	</div>
	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
