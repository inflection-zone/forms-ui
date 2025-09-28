<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';

	// Define breadcrumb type
	interface Breadcrumb {
		label: string;
		href: string;
		active: boolean;
	}

	// Get breadcrumbs based on current path
	const breadcrumbs = $derived(() => {
		const pathParts = page.url.pathname.split('/').filter(Boolean);
		const crumbs: Breadcrumb[] = [];
		
		if (pathParts.length >= 2 && pathParts[0] === 'users') {
			crumbs.push({ label: 'Dashboard', href: `/users/${pathParts[1]}/home`, active: false });
			
			if (pathParts.length >= 3) {
				switch (pathParts[2]) {
					case 'home':
						crumbs.push({ label: 'Home', href: '', active: true });
						break;
					case 'forms':
						if (pathParts.length === 3) {
							crumbs.push({ label: 'Forms', href: '', active: true });
						} else if (pathParts[3] === 'new') {
							crumbs.push({ label: 'Forms', href: `/users/${pathParts[1]}/forms`, active: false });
							crumbs.push({ label: 'New Template', href: '', active: true });
						} else {
							crumbs.push({ label: 'Forms', href: `/users/${pathParts[1]}/forms`, active: false });
							crumbs.push({ label: 'Template Details', href: '', active: true });
						}
						break;
					case 'template-explorer':
						crumbs.push({ label: 'Template Explorer', href: '', active: true });
						break;
					case 'field-libraries':
						if (pathParts.length === 3) {
							crumbs.push({ label: 'Field Library', href: '', active: true });
						} else if (pathParts[3] === 'custom') {
							crumbs.push({ label: 'Field Library', href: `/users/${pathParts[1]}/field-libraries`, active: false });
							if (pathParts[4] === 'new') {
								crumbs.push({ label: 'Create Custom Field', href: '', active: true });
							} else if (pathParts[4] === 'field-sets') {
								crumbs.push({ label: 'Create Field Set', href: '', active: true });
							} else if (pathParts[5] === 'edit') {
								crumbs.push({ label: 'Custom Field', href: `/users/${pathParts[1]}/field-libraries/${pathParts[4]}`, active: false });
								crumbs.push({ label: 'Edit', href: '', active: true });
							} else {
								crumbs.push({ label: 'Custom Field', href: '', active: true });
							}
						} else {
							crumbs.push({ label: 'Field Library', href: `/users/${pathParts[1]}/field-libraries`, active: false });
							crumbs.push({ label: 'Field Set Details', href: '', active: true });
						}
						break;
					default:
						crumbs.push({ label: pathParts[2].charAt(0).toUpperCase() + pathParts[2].slice(1), href: '', active: true });
				}
			}
		}
		
		return crumbs;
	});

	function navigateTo(href: string) {
		if (href) {
			window.location.href = href;
		}
	}
</script>

<!-- Breadcrumbs Strip -->
{#if breadcrumbs().length > 0}
	<div class="px-4 sm:px-6 lg:px-8 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<nav class="flex" aria-label="Breadcrumb">
			<ol class="flex items-center space-x-2">
				{#each breadcrumbs() as crumb, index}
					<li class="flex items-center">
						{#if index > 0}
							<Icon icon="material-symbols:chevron-right" width="16" height="16" class="text-gray-400 mx-2" />
						{/if}
						{#if crumb.active}
							<span class="text-sm font-medium text-gray-900 dark:text-white">{crumb.label}</span>
						{:else}
							<button 
								onclick={() => navigateTo(crumb.href)}
								class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							>
								{crumb.label}
							</button>
						{/if}
					</li>
				{/each}
			</ol>
		</nav>
	</div>
{/if}

