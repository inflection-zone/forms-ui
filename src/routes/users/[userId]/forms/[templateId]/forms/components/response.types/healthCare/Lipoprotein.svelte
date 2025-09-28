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
			{card.Title || 'Enter Lipoprotein'}
		</h1>
	</div>
	<Input disabled type="text" placeholder="Enter Lipoprotein here..." class="w-full p-2" />

	<div
		class="flex w-full flex-col items-start justify-start py-1 font-serif text-sm text-slate-500"
	>
		<div class="flex flex-col items-start justify-start">Normally : min 30mg/dL or 75 nmol/L</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
