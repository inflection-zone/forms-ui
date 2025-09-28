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
			{card.Title || 'Enter C-Reactive protein '}
		</h1>
	</div>
	<Input type="text" disabled placeholder="Enter C-Reactive Protein here...." class="w-full p-2" />

	<div class="h-fit w-full p-2">
		<div
			class="flex flex-col items-start justify-start space-y-1 py-1 font-serif text-sm text-slate-500"
		>
			<p>Normally (3 mg/L) :</p>
			<div class="flex flex-col items-start justify-start space-y-1">
				<div>
					<label for="low"> low: 1 mg/L</label>
				</div>
				<div>
					<label for="average"> Average:1-3 mg/L</label>
				</div>
				<div>
					<label for="high">High: 3 mg/L</label>
				</div>
			</div>
		</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
