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
			{card.Title || 'Enter Cholestrol'}
		</h1>
	</div>
	<Input type="text" disabled placeholder="Enter Cholesterol here...." class="w-full  p-2" />

	<div class="h-fit w-full p-2">
		<div
			class="flex flex-col items-start justify-start space-y-2 py-1 font-serif text-sm text-slate-500"
		>
			<p>Normal 200 mg/dL (5.2 mmol/L):</p>
			<div class="flex flex-col items-start justify-start space-y-2">
				<div>
					<input type="checkbox" name="HDL" value="HDL" placeholder="HDL" />
					<label for="HDL">Cholesterol (HDL)</label>
				</div>
				<div>
					<input type="checkbox" name="LDL" value="LDL" placeholder="LDL" />
					<label for="LDL">Cholesterol (LDL)</label>
				</div>
				<div>
					<input
						type="checkbox"
						name="Triglycerides"
						value="Triglycerides"
						placeholder="Triglycerides"
					/>
					<label for="Triglycerides">Triglycerides</label>
				</div>
			</div>
		</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
