<script lang="ts">
	let { activeView, onViewChange }: { 
		activeView: string; 
		onViewChange: (view: string) => void; 
	} = $props();

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		// { id: 'analytics', label: 'Analytics' },
		{ id: 'responses', label: 'Response Explorer' },
		{ id: 'individual', label: 'Individual Responses' },
		// { id: 'segments', label: 'Segments' }
	];
</script>

<div class="border-b border-border mb-4">
	<div class="flex space-x-8" role="tablist">
		{#each tabs as tab}
			<button 
				class="py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap {activeView === tab.id 
					? 'border-primary text-primary' 
					: 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'}"
				onclick={() => onViewChange(tab.id)}
				role="tab"
				aria-selected={activeView === tab.id}
			>
				{tab.label}
			</button>
		{/each}
	</div>
</div>
