<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

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
			{card.Title || 'Enter Hemoglobin A1C'}
		</h1>
	</div>
	<Input
		disabled
		type="text"
		placeholder="Enter Hemoglobin A1C in % here..."
		class="w-full border p-2"
	/>
	<div
		class="flex w-full flex-col items-start justify-start py-1 font-serif text-sm text-slate-500"
	>
		<div class="flex flex-col items-start justify-start">Normally : 5.7 %</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
