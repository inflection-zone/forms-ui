<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	interface FieldSet {
		id: string;
		name: string;
		description: string;
		category: string;
		industry: string;
		fieldCount: number;
		isCustom: boolean;
		isPopular: boolean;
		author: string;
		downloads: number;
		rating: number;
		tags: string[];
		fields?: Array<{
			name: string;
			type: string;
			required: boolean;
		}>;
		customFields?: Array<{
			id: string;
			name: string;
			description: string;
			layout: string;
			basicFields: string[];
		}>;
		createdAt: string;
		updatedAt: string;
	}

	let { data }: { data: PageData } = $props();

	const userId = page.params.userId;

	// State for filtering
	let selectedIndustry = $state('All');
	let selectedCategory = $state('All');
	let searchQuery = $state('');

	// Filter field sets based on industry, category, and search
	const filteredFieldSets = $derived(() => {
		let fieldSets: FieldSet[] = data.fieldSets || [];
		
		// Filter by industry
		if (selectedIndustry !== 'All') {
			fieldSets = fieldSets.filter(fs => fs.industry === selectedIndustry);
		}
		
		// Filter by category
		if (selectedCategory !== 'All') {
			fieldSets = fieldSets.filter(fs => fs.category === selectedCategory);
		}
		
		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			fieldSets = fieldSets.filter(fs => 
				fs.name.toLowerCase().includes(query) ||
				fs.description.toLowerCase().includes(query) ||
				fs.tags.some(tag => tag.toLowerCase().includes(query))
			);
		}
		
		return fieldSets;
	});

	// Helper functions
	function importFieldSet(fieldSetId: string) {
		console.log('Importing field set:', fieldSetId);
		// In real app, this would call API to import field set
		// Show success message
	}

	function previewFieldSet(fieldSet: FieldSet) {
		// Navigate to detailed view - different paths for custom vs regular field sets
		if (fieldSet.isCustom) {
			window.location.href = `/users/${userId}/field-libraries/custom-field-sets/${fieldSet.id}`;
		} else {
			window.location.href = `/users/${userId}/field-libraries/${fieldSet.id}`;
		}
	}

	function createCustomFieldSet() {
		window.location.href = `/users/${userId}/field-libraries/custom-field-sets`;
	}

	function createCustomField() {
		window.location.href = `/users/${userId}/field-libraries/custom-field-sets/new`;
	}

	function editFieldSet(fieldSetId: string) {
		window.location.href = `/users/${userId}/field-libraries/custom-field-sets/${fieldSetId}`;
	}

	function deleteFieldSet(fieldSetId: string) {
		console.log('Deleting field set:', fieldSetId);
		// Show confirmation and delete
	}

	function exportFieldSet(fieldSetId: string) {
		console.log('Exporting field set:', fieldSetId);
		// Export as JSON or other format
	}

	// Helper function to get star rating display
	function getStarRating(rating: number) {
		if (rating === 0) return '☆☆☆☆☆';
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
	<title>Field Library - Form Builder</title>
</svelte:head>

<div class="w-full bg-gray-50 dark:bg-gray-900">
	<!-- Header Section -->
	<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
						Field Library
					</h1>
					<p class="text-gray-600 dark:text-gray-400 mt-1">
						Industry-specific field sets and custom field collections
					</p>
				</div>
				<div class="flex items-center space-x-3">
					<button 
						onclick={createCustomField}
						class="inline-flex items-center px-4 py-2 border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
					>
						<Icon icon="material-symbols:add" class="mr-2" width="20" height="20" />
						Create Custom Field
					</button>
					<button 
						onclick={createCustomFieldSet}
						class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
					>
						<Icon icon="material-symbols:add" class="mr-2" width="20" height="20" />
						Create Field Set
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Search and Filter Section -->
		<div class="mb-8">
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex flex-col lg:flex-row gap-4">
					<!-- Search Input -->
					<div class="flex-1">
						<div class="relative">
							<Icon icon="material-symbols:search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" />
							<input
								bind:value={searchQuery}
								type="text"
								placeholder="Search field sets by name, description, or tags..."
								class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							/>
						</div>
					</div>
					
					<!-- Industry Filter -->
					<div class="lg:w-48">
						<select
							bind:value={selectedIndustry}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						>
							{#each data.industries as industry}
								<option value={industry}>{industry}</option>
							{/each}
						</select>
					</div>

					<!-- Category Filter -->
					<div class="lg:w-48">
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

		<!-- Custom Field Sets Section -->
		{#if data.customFieldSets.length > 0}
			<div class="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 mb-8">
				<div class="flex items-center justify-between mb-4">
					<div>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Custom Field Sets</h3>
						<p class="text-gray-600 dark:text-gray-400">Collections of your custom fields organized by purpose</p>
					</div>
					<div class="flex items-center space-x-2">
						<button 
							onclick={createCustomField}
							class="inline-flex items-center px-3 py-2 border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-sm"
						>
							<Icon icon="material-symbols:add" class="mr-1" width="16" height="16" />
							Custom Field
						</button>
						<button 
							onclick={createCustomFieldSet}
							class="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
						>
							<Icon icon="material-symbols:add" class="mr-1" width="16" height="16" />
							Field Set
						</button>
					</div>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each data.customFieldSets as fieldSet (fieldSet.id)}
						<div class="bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-purple-600 p-4 hover:shadow-md transition-shadow">
							<div class="flex items-center justify-between mb-3">
								<h4 class="font-semibold text-gray-900 dark:text-white">{fieldSet.name}</h4>
								<div class="flex items-center space-x-1">
									<button 
										onclick={() => previewFieldSet(fieldSet)}
										class="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
										title="View field set"
									>
										<Icon icon="material-symbols:visibility" width="16" height="16" />
									</button>
									<button 
										onclick={() => editFieldSet(fieldSet.id)}
										class="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
										title="Edit field set"
									>
										<Icon icon="material-symbols:edit" width="16" height="16" />
									</button>
									<button 
										onclick={() => exportFieldSet(fieldSet.id)}
										class="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
										title="Export field set"
									>
										<Icon icon="material-symbols:upload" width="16" height="16" />
									</button>
								</div>
							</div>
							<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{fieldSet.description}</p>
							<div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
								<span>{fieldSet.fieldCount} custom fields</span>
								<span>{fieldSet.tags.join(', ')}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Field Sets Grid -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
					{selectedIndustry === 'All' ? 'All Field Sets' : `${selectedIndustry} Field Sets`}
				</h3>
				<span class="text-sm text-gray-500 dark:text-gray-400">
					{filteredFieldSets().length} field set{filteredFieldSets().length !== 1 ? 's' : ''} found
				</span>
			</div>

			{#if filteredFieldSets().length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each filteredFieldSets() as fieldSet (fieldSet.id)}
						<div class="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
							<!-- Field Set Content (grows to fill space) -->
							<div class="flex-1">
								<!-- Field Set Header -->
								<div class="flex items-start justify-between mb-4">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<h4 class="font-semibold text-gray-900 dark:text-white">
												{fieldSet.name}
											</h4>
											{#if fieldSet.isCustom}
												<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
													<Icon icon="material-symbols:text-fields" class="mr-1" width="10" height="10" />
													Custom
												</span>
											{/if}
											{#if fieldSet.isPopular}
												<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
													<Icon icon="material-symbols:text-fields" class="mr-1" width="10" height="10" />
													Popular
												</span>
											{/if}
										</div>
										<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
											by {fieldSet.author}
										</p>
									</div>
									{#if !fieldSet.isCustom}
										<div class="flex items-center space-x-1">
											<span class="text-yellow-400 text-sm">{getStarRating(fieldSet.rating)}</span>
											<span class="text-xs text-gray-500 dark:text-gray-400">({fieldSet.rating})</span>
										</div>
									{/if}
								</div>

								<!-- Field Set Description -->
								<p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
									{fieldSet.description}
								</p>

								<!-- Field Set Meta Info -->
								<div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
									<span class="flex items-center">
										<Icon icon="material-symbols:text-fields" class="mr-1" width="12" height="12" />
										{fieldSet.fieldCount} fields
									</span>
									<span class="flex items-center">
										<Icon icon="material-symbols:category" class="mr-1" width="12" height="12" />
										{fieldSet.category}
									</span>
									{#if !fieldSet.isCustom}
										<span class="flex items-center">
											<Icon icon="material-symbols:download" class="mr-1" width="12" height="12" />
											{fieldSet.downloads}
										</span>
									{/if}
								</div>

								<!-- Field Set Tags -->
								<div class="flex flex-wrap gap-1 mb-4">
									{#each fieldSet.tags.slice(0, 3) as tag}
										<span class="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
											{tag}
										</span>
									{/each}
								</div>
							</div>

							<!-- Field Set Actions (pinned to bottom) -->
							<div class="flex gap-2 mt-auto">
								<button
									onclick={() => previewFieldSet(fieldSet)}
									class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
								>
									<Icon icon="material-symbols:visibility" class="mr-1" width="16" height="16" />
									Preview
								</button>
								{#if fieldSet.isCustom}
									<button
										onclick={() => editFieldSet(fieldSet.id)}
										class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
									>
										<Icon icon="material-symbols:edit" class="mr-1" width="16" height="16" />
										Edit
									</button>
								{:else}
									<button
										onclick={() => importFieldSet(fieldSet.id)}
										class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
									>
										<Icon icon="material-symbols:download" class="mr-1" width="16" height="16" />
										Import
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<Icon icon="material-symbols:text-fields" class="mx-auto text-gray-400 mb-4" width="48" height="48" />
					<h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
						{searchQuery ? 'No matching field sets' : 'No field sets available'}
					</h4>
					<p class="text-gray-500 dark:text-gray-400 mb-4">
						{searchQuery ? 'Try adjusting your search terms or filters' : 'Create your first custom field set to get started'}
					</p>
					{#if searchQuery}
						<button 
							onclick={() => { searchQuery = ''; selectedIndustry = 'All'; selectedCategory = 'All'; }}
							class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
						>
							<Icon icon="material-symbols:refresh" class="mr-2" width="20" height="20" />
							Clear Filters
						</button>
					{:else}
						<button 
							onclick={createCustomFieldSet}
							class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
						>
							<Icon icon="material-symbols:add" class="mr-2" width="20" height="20" />
							Create Field Set
						</button>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Quick Access Section -->
		{#if data.popularFieldSets.length > 0}
			<div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mt-8">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Popular Field Sets</h3>
				<p class="text-gray-600 dark:text-gray-400 mb-4">Most used field sets across all industries</p>
				
				<div class="flex flex-wrap gap-3">
					{#each data.popularFieldSets.slice(0, 3) as fieldSet (fieldSet.id)}
						<button 
							onclick={() => importFieldSet(fieldSet.id)}
							class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
						>
							<Icon icon="material-symbols:download" class="mr-2" width="20" height="20" />
							{fieldSet.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}

	</div>
</div>
