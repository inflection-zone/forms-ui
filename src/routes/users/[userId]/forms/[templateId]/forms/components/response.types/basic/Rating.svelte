<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
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
		<h1 class="text-md font-bold text-slate-400">{card.Title || 'Give us a rating'}
			{#if card.IsRequired}
			<span class="text-red-600 ml-1">*</span>
			{/if}
		</h1>
	</div>
	<div class="h-fit w-full rounded">
		<div class="flex items-start justify-start py-2 pl-2 font-serif text-sm text-slate-500">
			{#each ['ic:sharp-star-rate', 'ic:sharp-star-rate', 'ic:sharp-star-rate', 'ic:twotone-star-half'] as icon}
				<Icon {icon} width="15" height="15" />
			{/each}
		</div>
	</div>
	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>
