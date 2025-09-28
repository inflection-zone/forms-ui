<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	////////////////////////////////////////////////////////////////

	let { openSheet, card } = $props();

	let optionsArray = $state(card.Options??[]);
    // console.log("optionsArray");
    // $inspect(optionsArray);

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
		<h1 class="text-md font-bold text-slate-400">
			{card.Title || 'Enter multiple choice question'}
			{#if card.IsRequired}
			<span class="text-red-600 ml-1">*</span>
			{/if}
		</h1>
	</div>
	<div class=" h-fit w-full rounded p-1">
     	{#each optionsArray as option, index}
			<div class="flex items-center">
				<input type="checkbox" id={`option${index}`} name="options" disabled />
				<label for={`option${index}`} class="ml-2 font-serif text-sm text-slate-500">{option}</label
				>
			</div>
		{/each}
	</div>
	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
