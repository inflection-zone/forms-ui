<script lang="ts">
	import type { LayoutProps } from './$types';
	import { onMount } from 'svelte';
	import { IndexedDbStorageManager } from '$lib/utils/indexdb.store.manager';
	import { env } from '$env/dynamic/public';
	////////////////////////////////////////////////////////////////////////////////////////

	let { data, children }: LayoutProps = $props();

	const templateStorage = new IndexedDbStorageManager('templates', 'template_list');
	const generalStorage = new IndexedDbStorageManager('general', 'environment_variables');

	const baseUrl = env.PUBLIC_THIS_BASE_URL;

	onMount(async () => {
		// Only store templates with IsFavourite: true
		for (const template of data.templates) {
			if (template.IsFavourite === true) {
				await templateStorage.set(template.id, template);
			}
		}
		await generalStorage.set('this_base_url', {baseUrl});
		console.log('✅ Favourite templates saved to IndexedDB');
	});
</script>

<div class="flex h-screen flex-col">
	<div class="fixed top-0 z-50 w-full bg-emerald-500">
		<!-- <Navbar /> -->
	</div>
	<div class="bg-sl h-full">
		{@render children()}
	</div>
</div>
