<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

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
			{card.Title || 'Enter blood pressure'}
			{#if card.IsRequired}
				<span class="ml-1 text-red-600">*</span>
			{/if}
		</h1>
	</div>
	<!-- <Input type="text" disabled placeholder="Enter Blood Pressure here..." class="w-full  p-2" /> -->

	<div class="w-full space-y-3 rounded-lg">
		<div class="flex flex-col space-y-2">
			<div class="flex items-center space-x-2">
				<Label for="systolic" class="mr-2 text-slate-400">Systolic</Label>
				<!-- <Input
					disabled
					type="text"
					name="systolic"
					placeholder="Enter the systolic blood pressure here..."
					class="w-full"
				/> -->

				<div class=" rounded-md border bg-slate-50 py-2 pl-2 pr-10 text-slate-400">
					<p class="text-sm">Enter the systolic blood pressure in mmHg</p>
				</div>
				<!-- 
		 <div class="text-slate-400">
			mmHg
		 </div> -->
			</div>
			<div class="flex items-center space-x-2">
				<Label for="diastolic" class="text-slate-400">Diastolic</Label>
				<!-- <Input
					disabled
					type="text"
					name="diastolic"
					placeholder="Enter the distolic blood pressure here..."
					class="w-full"
				/> -->
				<div class=" rounded-md border bg-slate-50 py-2 pl-2 pr-10 text-slate-400">
					<p class="text-sm">Enter the distolic blood pressure in mmHg</p>
				</div>
				<!-- <div class="text-slate-400">
				mmHg
			 </div> -->
			</div>
		</div>
	</div>
	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
