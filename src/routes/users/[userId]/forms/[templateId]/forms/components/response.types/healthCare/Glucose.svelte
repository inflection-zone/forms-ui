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
			{card.Title || 'Enter Glucose level'}
		</h1>
	</div>
	<Input type="text" disabled placeholder="Enter Glucose level here..." class="w-full p-2" />
	<div class="h-fit w-full p-2">
		<div
			class="flex flex-col items-start justify-start space-y-2 py-1 font-serif text-sm text-slate-500"
		>
			<p>Normally :</p>
			<div class="flex flex-col items-start justify-start space-y-2">
				<div>
					<label for="Celsius">Fasting [70-99 mg/dL (3.9-5.5 mmol/L)]</label>
				</div>
				<div>
					<label for="Fahrenheit">Non-Fasting [min 140 mg/dL (7.8 mmol/L)]</label>
				</div>
			</div>
		</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
