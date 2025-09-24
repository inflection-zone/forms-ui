<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	let { data, options = {} }: { data: any; options?: any } = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	// Register all Chart.js components
	Chart.register(...registerables);

	onMount(() => {
		if (canvas && data) {
			chart = new Chart(canvas, {
				type: 'bar',
				data,
				options: {
					responsive: true,
					maintainAspectRatio: false,
					...options
				}
			});
		}

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});

	// Reactive effect to update chart when data changes
	$effect(() => {
		if (chart && data) {
			chart.data = data;
			chart.update();
		}
	});
</script>

<canvas bind:this={canvas}></canvas>
