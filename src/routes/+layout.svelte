<script lang="ts">
	import '../app.css';
	import { addToast } from '$lib/components/toast/toast.store';
	import Toasts from '$lib/components/toast/toasts.svelte';
	import { page } from '$app/state';
	import { getFlash } from 'sveltekit-flash-message';
	import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';
	import '$lib/utils/offline-submission-console';

	///////////////////////////////////////////////////////////////////////////

	var systemName = 'Form Builder and sharing service';

	let { children } = $props();
	const flash = getFlash(page);

	flash.subscribe(($flash) => {
		if (!$flash) return;
		addToast({
			type: $flash.type || 'info',
			message: $flash.message,
			dismissible: true,
			timeout: 3000
		});
		flash.set(undefined);
	});

	// Handle errors from any child routes
	let error = $state(null);
	let status = $state(200);

	$effect(() => {
		if (page.error) {
			error = page.error;
			status = page.status;
		} else {
			error = null;
			status = 200;
		}
	});

</script>

<svelte:head>
	<title>{systemName}</title>
	<meta name="description" content="Form Service" />
</svelte:head>

<Toasts />

<!-- Main Content Area -->
<div class="flex-1 overflow-auto">
	{#if error}
		<ErrorBoundary {error} {status} />
	{:else}
		{@render children()}
	{/if}
</div>
