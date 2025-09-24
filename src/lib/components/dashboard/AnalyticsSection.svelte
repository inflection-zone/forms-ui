<script lang="ts">
	import BarChart from './charts/BarChart.svelte';

	let { performanceData, satisfactionData, funnelData }: { 
		performanceData: any; 
		satisfactionData: any; 
		funnelData: any; 
	} = $props();
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
	<div class="bg-card p-6 rounded-xl shadow-sm border border-border">
		<h3 class="text-lg font-semibold mb-4 text-card-foreground">Question Performance</h3>
		<div class="h-72">
			<BarChart 
				data={performanceData} 
				options={{ 
					plugins: { legend: { display: false } },
					scales: { y: { beginAtZero: true, max: 100 } }
				}} 
			/>
		</div>
	</div>
	<div class="bg-card p-6 rounded-xl shadow-sm border border-border">
		<h3 class="text-lg font-semibold mb-4 text-card-foreground">Satisfaction Distribution</h3>
		<div class="h-72">
			<BarChart data={satisfactionData} />
		</div>
	</div>
</div>
<div class="bg-card p-6 rounded-xl shadow-sm mb-6 border border-border">
	<h3 class="text-lg font-semibold mb-4 text-card-foreground">Response Funnel</h3>
	<div class="h-72">
		<BarChart 
			data={funnelData} 
			options={{ plugins: { legend: { display: false } } }} 
		/>
	</div>
</div>
