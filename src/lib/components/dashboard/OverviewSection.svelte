<script lang="ts">
	import LineChart from './charts/LineChart.svelte';
	import DoughnutChart from './charts/DoughnutChart.svelte';

	let { formData, responseTrendData, sourceData }: { 
		formData: any; 
		responseTrendData: any; 
		sourceData: any; 
	} = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
	<div class="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border">
		<div class="text-3xl font-bold text-card-foreground mb-2">{formData.totalResponses.toLocaleString()}</div>
		<div class="text-muted-foreground text-sm mb-2">Total Responses</div>
		<div class="text-green-600 text-xs font-medium">+18% from last week</div>
	</div>
	<div class="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border">
		<div class="text-3xl font-bold text-card-foreground mb-2">{formData.completionRate}%</div>
		<div class="text-muted-foreground text-sm mb-2">Completion Rate</div>
		<div class="text-green-600 text-xs font-medium">+2.1% improvement</div>
	</div>
	<div class="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border">
		<div class="text-3xl font-bold text-card-foreground mb-2">{formData.medianTime}</div>
		<div class="text-muted-foreground text-sm">Median Response Time</div>
	</div>
	<div class="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border">
		<div class="text-3xl font-bold text-card-foreground mb-2">{formData.highestDropoff}</div>
		<div class="text-muted-foreground text-sm">Highest Drop-off Question</div>
	</div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
	<div class="lg:col-span-2 bg-card p-6 rounded-xl shadow-sm border border-border">
		<h3 class="text-lg font-semibold mb-4 text-card-foreground">Response Trends</h3>
		<div class="h-72">
			<LineChart data={responseTrendData} options={{ plugins: { legend: { display: false } } }} />
		</div>
	</div>
	<div class="bg-card p-6 rounded-xl shadow-sm border border-border">
		<h3 class="text-lg font-semibold mb-4 text-card-foreground">Response Sources</h3>
		<div class="h-72">
			<DoughnutChart data={sourceData} />
		</div>
	</div>
</div>
