<script lang="ts">
	let { activeView, onViewChange }: { 
		activeView: string; 
		onViewChange: (view: string) => void; 
	} = $props();

	const navItems = [
		{ id: 'overview', label: 'Overview' },
		// { id: 'analytics', label: 'Analytics' },
		{ id: 'responses', label: 'Responses' },
		{ id: 'individual', label: 'Individual' },
		// { id: 'segments', label: 'Segments' },
		{ id: 'export', label: 'Export' }
	];
</script>

<aside class="w-64 bg-card text-card-foreground p-5 fixed h-screen overflow-y-auto top-10 border-r border-border">
	<div class="pb-8 border-b border-border">
		<h2 class="text-xl font-semibold">FormAnalytics</h2>
	</div>
	<nav class="pt-5">
		{#each navItems as item}
			<button 
				class="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors duration-300 {activeView === item.id ? 'bg-accent text-accent-foreground border-r-4 border-primary' : ''}"
				onclick={() => onViewChange(item.id)}
			>
				{item.label}
			</button>
		{/each}
	</nav>
</aside>
