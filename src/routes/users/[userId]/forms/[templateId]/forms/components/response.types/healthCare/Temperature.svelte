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
			{card.Title || 'Enter Temperature'}
			{#if card.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</h1>
	</div>
	<div class="w-full rounded-md border bg-slate-50 py-2 pl-2 pr-10 text-left text-slate-400">
		<p class="text-sm">Body Temperature (in Fahrenheit)</p>
	</div>
	<!-- <Input type="text" disabled placeholder="Enter the temperature here..." class="w-full p-2" /> -->
	<!-- <div class=" h-fit w-full">
		<div
			class="flex flex-col items-start justify-start space-y-2 py-1 font-serif text-sm text-slate-500"
		>
			<p>Select Unit :</p>
			<div class="flex flex-col items-start justify-start space-y-2">
				<div>
					<input type="checkbox" name="Celsius" value="Celsius" placeholder="Celsius" />
					<label for="Celsius">Celsius</label>
				</div>
				<div>
					<input type="checkbox" name="Fahrenheit" value="Fahrenheit" placeholder="Fahrenheit" />
					<label for="Fahrenheit">Fahrenheit</label>
				</div>
				<div>
					<input type="checkbox" name="Kelvin" value="Kelvin" placeholder="Kelvin" />
					<label for="Kelvin">Kelvin</label>
				</div>
			</div>
		</div>
	</div>
	<div class="w-full justify-start font-serif text-sm text-slate-500">
		<p class="flex">Normal Range (Refer these ranges for standard range):</p>
		<li class="flex flex-col items-start text-xs">
			<ol>Oral: [36.1°C to 37.2°C] [97°F to 99°F] [309.25 K to 310.35 K]</ol>
			<ol>Rectal: [36.6°C to 37.8°C] [97.9°F to 100.4°F] [309.75 K to 310.95 K]</ol>
			<ol>Axillary (underarm): [35.5°C to 37.0°C] [95.9°F to 98.6°F] [308.65 K to 310.15 K]</ol>
		</li>
	</div> -->

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
