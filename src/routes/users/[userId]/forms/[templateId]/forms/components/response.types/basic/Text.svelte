<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';

	////////////////////////////////////////////////////////////////

	let { openSheet, card } = $props();
</script>

<Button
   		class="flex w-full h-fit flex-col gap-2 p-4 hover:border hover:border-dashed hover:border-gray-500 text-left items-start"
	onclick={() => {
		openSheet(card);
	}}
	variant="ghost"
>
	<div class="flex w-full items-center justify-between">
		<h1 class="text-md font-bold text-slate-400">{card.Title || 'Enter question here'}
			{#if card.IsRequired}
			<span class="text-red-600 ml-1">*</span>
			{/if}
		</h1>
		<!-- <p>{responseType}</p> -->
	</div>
	<div class="h-fit w-full rounded">
		<div class="flex items-start justify-start py-2 pl-2 font-serif text-sm text-slate-500">
			<Icon icon="fluent:text-12-regular" width="15" height="15" />
			<p class="ml-1">Text</p>
		</div>
	</div>

	<div>
		<p class="text-sm text-slate-400">{card.Description || ''}</p>
	</div>
</Button>

<!-- <Button
    class="flex w-full h-fit flex-col gap-2 p-4 hover:border hover:border-dashed hover:border-gray-500 text-left items-start"
    onclick={() => questionEditRoute(id)}
    variant="ghost"
>
    <h1 class="text-md font-bold text-slate-400">{card.Title || 'Enter question here'}</h1>
    <div class="flex items-center gap-1 text-sm font-serif text-slate-500">
        <Icon icon="fluent:text-12-regular" width="15" height="15" />
        <p>Text</p>
    </div>
    <p class="text-sm text-slate-400">{card.Description || ''}</p>
</Button> -->