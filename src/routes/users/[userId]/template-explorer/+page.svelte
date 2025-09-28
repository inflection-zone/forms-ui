<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	interface Template {
		id: string;
		title: string;
		description: string;
		category: string;
		tags: string[];
		author: string;
		rating: number;
		downloads: number;
		preview: string;
		fields: number;
		estimatedTime: string;
		createdAt: string;
		isPopular: boolean;
		isFree: boolean;
		price?: number;
	}

	let { data }: { data: PageData } = $props();

	const userId = page.params.userId;

	// State for filtering
	let selectedCategory = $state('All');
	let searchQuery = $state('');

	// Filter templates based on category and search
	const filteredTemplates = $derived(() => {
		let templates: Template[] = data.templates || [];
		
		// Filter by category
		if (selectedCategory !== 'All') {
			templates = templates.filter(t => t.category === selectedCategory);
		}
		
		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			templates = templates.filter(t => 
				t.title.toLowerCase().includes(query) ||
				t.description.toLowerCase().includes(query) ||
				t.tags.some(tag => tag.toLowerCase().includes(query))
			);
		}
		
		return templates;
	});

	// Helper function to import template
	function importTemplate(templateId: string) {
		// In real app, this would call API to import template
		console.log('Importing template:', templateId);
		// Navigate to forms page after import
		window.location.href = `/users/${userId}/forms`;
	}

	// Helper function to preview template
	function previewTemplate(templateId: string) {
		// In real app, this would open preview modal or navigate to preview
		console.log('Previewing template:', templateId);
	}

	// Helper function to get star rating display
	function getStarRating(rating: number) {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
		
		let stars = '';
		for (let i = 0; i < fullStars; i++) stars += '★';
		if (hasHalfStar) stars += '☆';
		for (let i = 0; i < emptyStars; i++) stars += '☆';
		
		return stars;
	}
</script>

<svelte:head>
	<title>Template Explorer - Form Builder</title>
</svelte:head>

<div class="w-full bg-gray-50 dark:bg-gray-900">
	<!-- Header Section -->
	<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
						Template Explorer
					</h1>
					<p class="text-gray-600 dark:text-gray-400 mt-1">
						Discover and import ready-to-use form templates
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Search and Filter Section -->
		<div class="mb-8">
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex flex-col md:flex-row gap-4">
					<!-- Search Input -->
					<div class="flex-1">
						<div class="relative">
							<Icon icon="material-symbols:search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" />
							<input
								bind:value={searchQuery}
								type="text"
								placeholder="Search templates by name, description, or tags..."
								class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							/>
						</div>
					</div>
					
					<!-- Category Filter -->
					<div class="md:w-48">
						<select
							bind:value={selectedCategory}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						>
							{#each data.categories as category}
								<option value={category}>{category}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
		</div>

		<!-- Stats Row -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Templates</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">{data.totalTemplates}</p>
					</div>
					<div class="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
						<Icon icon="material-symbols:text-fields" class="text-blue-600 dark:text-blue-400" width="24" height="24" />
					</div>
				</div>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Popular Templates</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">{data.popularTemplates.length}</p>
					</div>
					<div class="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
						<Icon icon="material-symbols:text-fields" class="text-orange-600 dark:text-orange-400" width="24" height="24" />
					</div>
				</div>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Free Templates</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">{data.freeTemplates.length}</p>
					</div>
					<div class="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg">
						<Icon icon="material-symbols:text-fields" class="text-green-600 dark:text-green-400" width="24" height="24" />
					</div>
				</div>
			</div>
		</div>

		<!-- Templates Grid -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
					{selectedCategory === 'All' ? 'All Templates' : `${selectedCategory} Templates`}
				</h3>
				<span class="text-sm text-gray-500 dark:text-gray-400">
					{filteredTemplates().length} template{filteredTemplates().length !== 1 ? 's' : ''} found
				</span>
			</div>

			{#if filteredTemplates().length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each filteredTemplates() as template (template.id)}
						<div class="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
							<!-- Template Content (grows to fill space) -->
							<div class="flex-1">
								<!-- Template Header -->
								<div class="flex items-start justify-between mb-4">
									<div class="flex-1">
										<h4 class="font-semibold text-gray-900 dark:text-white mb-1">
											{template.title}
										</h4>
										<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
											by {template.author}
										</p>
										{#if template.isPopular}
											<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
												<Icon icon="material-symbols:text-fields" class="mr-1" width="12" height="12" />
												Popular
											</span>
										{/if}
									</div>
									<div class="flex items-center space-x-1">
										<span class="text-yellow-400 text-sm">{getStarRating(template.rating)}</span>
										<span class="text-xs text-gray-500 dark:text-gray-400">({template.rating})</span>
									</div>
								</div>

								<!-- Template Description -->
								<p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
									{template.description}
								</p>

								<!-- Template Meta Info -->
								<div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
									<span class="flex items-center">
										<Icon icon="material-symbols:text-fields" class="mr-1" width="12" height="12" />
										{template.fields} fields
									</span>
									<span class="flex items-center">
										<Icon icon="material-symbols:schedule" class="mr-1" width="12" height="12" />
										{template.estimatedTime}
									</span>
									<span class="flex items-center">
										<Icon icon="material-symbols:download" class="mr-1" width="12" height="12" />
										{template.downloads}
									</span>
								</div>

								<!-- Template Tags -->
								<div class="flex flex-wrap gap-1 mb-4">
									{#each template.tags.slice(0, 3) as tag}
										<span class="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
											{tag}
										</span>
									{/each}
								</div>
							</div>

							<!-- Template Actions (pinned to bottom) -->
							<div class="flex gap-2 mt-auto">
								<button
									onclick={() => previewTemplate(template.id)}
									class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
								>
									<Icon icon="material-symbols:visibility" class="mr-1" width="16" height="16" />
									Preview
								</button>
								<button
									onclick={() => importTemplate(template.id)}
									class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
								>
									<Icon icon="material-symbols:download" class="mr-1" width="16" height="16" />
									Import
								</button>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<Icon icon="material-symbols:text-fields" class="mx-auto text-gray-400 mb-4" width="48" height="48" />
					<h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
						{searchQuery ? 'No matching templates' : 'No templates available'}
					</h4>
					<p class="text-gray-500 dark:text-gray-400 mb-4">
						{searchQuery ? 'Try adjusting your search terms or category filter' : 'Check back later for new templates'}
					</p>
					{#if searchQuery}
						<button 
							onclick={() => { searchQuery = ''; selectedCategory = 'All'; }}
							class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
						>
							<Icon icon="material-symbols:refresh" class="mr-2" width="20" height="20" />
							Clear Filters
						</button>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Quick Import Section -->
		{#if data.popularTemplates.length > 0}
			<div class="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 mt-8">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Popular Templates</h3>
				<p class="text-gray-600 dark:text-gray-400 mb-4">Quick access to the most downloaded templates</p>
				
				<div class="flex flex-wrap gap-3">
					{#each data.popularTemplates.slice(0, 3) as template (template.id)}
						<button 
							onclick={() => importTemplate(template.id)}
							class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
						>
							<Icon icon="material-symbols:download" class="mr-2" width="20" height="20" />
							{template.title}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
