<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';

	// Define `error` and `status` with default values to avoid undefined errors
	export let error: Error = new Error('Unknown error');
	export let status: number = 500;
	let route = page.url.pathname;
</script>

<main class="flex min-h-screen flex-col items-center justify-center p-4 text-center">
	<h1 class="text-4xl font-bold text-red-600">Error {status}</h1>
	<p>
		At routepath
		<span class="text-blue-600 underline">
			{route}
		</span>
	</p>
	<p class="mt-4 text-lg">
		{error?.message || 'Something went wrong. Please try again later.'}
	</p>

	<div class="mt-8 space-x-4">
		<Button onclick={() => window.location.reload()}>Retry</Button>
		<Button variant="link" href="/" class="">Go Home</Button>
	</div>
</main>
