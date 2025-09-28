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
	<div class="flex w-full items-center justify-between py-1">
		<h1 class="text-md font-bold text-slate-400">
			{card.Title || 'Enter Heart rate'}
			{#if card.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</h1>
	</div>
	<div class="w-full rounded-md border bg-slate-50 py-2 pl-2 pr-10 text-left text-slate-400">
		<p class="text-sm">Heart Pulse Rate (in bits per minute)</p>
	</div>
	<!-- <Input type="text" disabled placeholder="Enter the heart rate here..." class="w-full  p-2" /> -->

	<!-- <div
		class="flex w-full flex-col items-start justify-start space-y-2 py-1 font-serif text-sm text-slate-500"
	>
		<p>Normally : 60-100 bpm</p>
	</div> -->

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
