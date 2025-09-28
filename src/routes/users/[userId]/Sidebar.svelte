<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';

	// Props
	let { collapsed = $bindable(false) } = $props();

	// Get current user ID from path
	let userId = $state('');
	$effect(() => {
		const pathParts = page.url.pathname.split('/');
		const userIndex = pathParts.indexOf('users');
		userId = userIndex !== -1 && pathParts[userIndex + 1] ? pathParts[userIndex + 1] : '';
	});

	// Navigation items - using derived for reactivity
	const navItems = $derived([
		{
			label: 'Home',
			icon: 'material-symbols:home',
			href: userId ? `/users/${userId}/home` : '#',
			isActive: () => page.url.pathname.includes('/home')
		},
		{
			label: 'Forms',
			icon: 'material-symbols:description',
			href: userId ? `/users/${userId}/forms` : '#',
			isActive: () => page.url.pathname.includes('/forms') && !page.url.pathname.includes('/forms/')
		}
	]);

	function navigateTo(href: string) {
		if (href !== '#') {
			window.location.href = href;
		}
	}
</script>

<!-- Sidebar -->
<div class="flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 {collapsed ? 'w-20' : 'w-64'}">
	<!-- Sidebar Header -->

	<!-- Navigation Items -->
	<nav class="flex-1 p-4">
		<div class="space-y-2">
			{#each navItems as item}
				<button
					onclick={() => navigateTo(item.href)}
					class="w-full flex items-center p-3 rounded-lg transition-colors {
						item.isActive() 
							? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' 
							: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
					}"
					title={collapsed ? item.label : ''}
				>
					<Icon icon={item.icon} width="20" height="20" class="flex-shrink-0" />
					{#if !collapsed}
						<span class="ml-3 font-medium">{item.label}</span>
					{/if}
				</button>
			{/each}
		</div>
	</nav>

	<!-- Sidebar Footer -->
	<div class="p-4 border-t border-gray-200 dark:border-gray-700">
		{#if !collapsed}
			<div class="text-xs text-gray-500 dark:text-gray-400">
				Form Builder v1.0
			</div>
		{/if}
	</div>
</div>
