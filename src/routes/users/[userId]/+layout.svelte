<script lang="ts">
	import TopNavigation from './TopNavigation.svelte';
	import Sidebar from './Sidebar.svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// Sidebar state
	let sidebarCollapsed = $state(false);

	// Mock user data - in real app this would come from server or store
	const user = {
		name: 'John Doe',
		role: 'Admin'
	};

	// Check if current page should show sidebar (exclude specific routes like form builder)
	const shouldShowSidebar = $derived(() => {
		const currentPath = page.url.pathname;
		// Don't show sidebar for templateId form builder pages
		if (currentPath.includes('/form-templates/') && currentPath.split('/').length > 4) {
			return false;
		}
		return true;
	});
</script>

<div class="flex flex-col h-screen">
	<!-- Top Navigation -->
	<TopNavigation {user} />

	<!-- Main Layout -->
	<div class="flex flex-1 overflow-hidden">
		{#if shouldShowSidebar()}
			<!-- Sidebar -->
			<Sidebar bind:collapsed={sidebarCollapsed} />
		{/if}

		<!-- Main Content Area -->
		<div class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
			<!-- Breadcrumbs -->
			<Breadcrumbs />
			
			<!-- Page Content -->
			<div class="flex-1">
				{@render children()}
			</div>
		</div>
	</div>
</div>
