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
			{card.Title || 'Enter Weist size '}
		</h1>
	</div>
	<Input
		disabled
		type="text"
		placeholder="Enter Weist size in cm /inches here..."
		class="w-full border p-2"
	/>
	<div class=" h-fit w-full">
		<div
			class="flex flex-col items-start justify-start py-2 pl-2 font-serif text-sm text-slate-600"
		>
			<p>Select Unit :</p>
			<div class="flex flex-col items-start justify-start">
				<div>
					<label for="Men">Men [94 cm (37 inches)]</label>
				</div>
				<div>
					<label for="Women">Women [80 cm (31.5 inches)]</label>
				</div>
			</div>
		</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
