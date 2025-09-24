<script lang="ts">
	let { activeView, onViewChange }: { 
		activeView: string; 
		onViewChange: (view: string) => void; 
	} = $props();

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'analytics', label: 'Analytics' },
		{ id: 'responses', label: 'Response Explorer' },
		{ id: 'individual', label: 'Individual Responses' },
		{ id: 'segments', label: 'Segments' }
	];
</script>

<div class="bg-card rounded-lg p-1 mb-6 shadow-sm flex border border-border">
	{#each tabs as tab}
		<button 
			class="flex-1 py-3 px-6 text-center rounded-md transition-colors font-medium {activeView === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}"
			onclick={() => onViewChange(tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>
