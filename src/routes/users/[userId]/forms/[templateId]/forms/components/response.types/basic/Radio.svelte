<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';

	////////////////////////////////////////////////////////////////

	let { openSheet, card } = $props();

	let optionsArray = $state(card.Options??[]);

    $effect(() => {
        optionsArray = card?.Options?.map((option) => option.Text);
    })

    
	// if (card.Options && Array.isArray(card.Options) && card.Options.length > 0) {
	// 	optionsArray = card.Options.map((option) => option.Text);
	// } else {
	// 	optionsArray = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
	// }
</script>

<Button
			class="flex h-fit w-full flex-col space-y-2 p-4 hover:border hover:border-dashed hover:border-gray-500"
	onclick={() => {
		openSheet(card);
	}}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md text-wrap text-left font-bold text-slate-400">
			{card.Title || 'Enter single choice question'}
			{#if card.IsRequired}
			<span class="text-red-600 ml-1">*</span>
			{/if}
		</h1>
		<!-- <p class="relative">{responseType}</p> -->
	</div>
	<div class="flex h-fit w-full flex-col rounded p-1">
		{#each optionsArray as option, index}
			<div class="flex items-start justify-start font-serif text-sm text-slate-500">
				<Icon icon="eva:radio-button-off-outline" width="15" height="15" />
				<label for={`option${index}`} class="ml-2 font-serif text-sm text-slate-500">{option}</label
				>
			</div>
		{/each}
	</div>
	<div>
		<p class="text-wrap text-left text-sm text-slate-400">{card[0]?.Description || ''}</p>
	</div>
</Button>
