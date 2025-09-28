<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	interface Field {
		id: string;
		name: string;
		type: string;
		required: boolean;
		icon: string;
	}

	interface FieldCategory {
		name: string;
		icon: string;
		fields: Field[];
	}

	interface FieldSet {
		id: string;
		name: string;
		description: string;
		category: string;
		industry: string;
		fieldCount: number;
		isCustom: boolean;
		author: string;
		downloads?: number;
		rating?: number;
		tags: string[];
		fieldCategories: FieldCategory[];
		createdAt: string;
		updatedAt: string;
	}

	let { data }: { data: PageData } = $props();

	const userId = page.params.userId;
	const fieldSetId = page.params.fieldSetId;

	// Helper functions
	function importFieldSet() {
		console.log('Importing field set:', fieldSetId);
		// Navigate back to field library after import
		window.location.href = `/users/${userId}/field-libraries`;
	}

	function editFieldSet() {
		console.log('Editing field set:', fieldSetId);
		window.location.href = `/users/${userId}/field-libraries/custom/${fieldSetId}/edit`;
	}

	function goBackToLibrary() {
		window.location.href = `/users/${userId}/field-libraries`;
	}

	function addToForm() {
		console.log('Adding fields to form');
		// This would integrate with form builder
	}

	// Helper function to get field type display info
	function getFieldTypeInfo(type: string) {
		const typeMap: Record<string, { label: string; color: string; icon: string }> = {
			'text': { label: 'Single Line', color: 'blue', icon: 'material-symbols:text-fields' },
			'textarea': { label: 'Multi Line', color: 'blue', icon: 'material-symbols:notes' },
			'email': { label: 'Email', color: 'green', icon: 'material-symbols:email' },
			'tel': { label: 'Phone', color: 'green', icon: 'material-symbols:phone' },
			'number': { label: 'Number', color: 'purple', icon: 'material-symbols:numbers' },
			'date': { label: 'Date', color: 'orange', icon: 'material-symbols:calendar-today' },
			'select': { label: 'Dropdown', color: 'indigo', icon: 'material-symbols:arrow-drop-down' },
			'checkbox': { label: 'Checkbox', color: 'gray', icon: 'material-symbols:check-box' },
			'address': { label: 'Address', color: 'green', icon: 'material-symbols:location-on' }
		};
		
		return typeMap[type] || { label: type, color: 'gray', icon: 'material-symbols:text-fields' };
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
	<title>{data.fieldSet.name} - Field Library</title>
</svelte:head>

<div class="w-full bg-gray-50 dark:bg-gray-900">
	<!-- Header Section -->
	<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<button 
						onclick={goBackToLibrary}
						class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						title="Back to Field Library"
					>
						<Icon icon="material-symbols:arrow-back" width="24" height="24" />
					</button>
					<div>
						<div class="flex items-center space-x-3 mb-1">
							<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
								{data.fieldSet.name}
							</h1>
							{#if data.fieldSet.isCustom}
								<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
									<Icon icon="material-symbols:text-fields" class="mr-1" width="16" height="16" />
									Custom
								</span>
							{/if}
						</div>
						<p class="text-gray-600 dark:text-gray-400">
							{data.fieldSet.description}
						</p>
					</div>
				</div>
				<div class="flex items-center space-x-3">
					{#if data.fieldSet.isCustom}
						<button 
							onclick={editFieldSet}
							class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
						>
							<Icon icon="material-symbols:edit" class="mr-2" width="20" height="20" />
							Edit Field Set
						</button>
					{:else}
						<button 
							onclick={importFieldSet}
							class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
						>
							<Icon icon="material-symbols:download" class="mr-2" width="20" height="20" />
							Import Field Set
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Field Set Info -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
				<div class="text-center">
					<Icon icon="material-symbols:text-fields" class="mx-auto mb-2 text-blue-600" width="32" height="32" />
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{data.fieldSet.fieldCount}</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">Total Fields</p>
				</div>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
				<div class="text-center">
					<Icon icon="material-symbols:category" class="mx-auto mb-2 text-purple-600" width="32" height="32" />
					<p class="text-lg font-semibold text-gray-900 dark:text-white">{data.fieldSet.category}</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">Category</p>
				</div>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
				<div class="text-center">
					<Icon icon="material-symbols:business" class="mx-auto mb-2 text-green-600" width="32" height="32" />
					<p class="text-lg font-semibold text-gray-900 dark:text-white">{data.fieldSet.industry}</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">Industry</p>
				</div>
			</div>

			{#if !data.fieldSet.isCustom}
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
					<div class="text-center">
						<div class="text-yellow-400 text-lg mb-1">{getStarRating(data.fieldSet.rating)}</div>
						<p class="text-lg font-semibold text-gray-900 dark:text-white">{data.fieldSet.rating}</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">{data.fieldSet.downloads} downloads</p>
					</div>
				</div>
			{:else}
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
					<div class="text-center">
						<Icon icon="material-symbols:person" class="mx-auto mb-2 text-orange-600" width="32" height="32" />
						<p class="text-lg font-semibold text-gray-900 dark:text-white">Custom</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">Your Creation</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Field Categories -->
		{#each data.fieldSet.fieldCategories as category}
			<div class="mb-8">
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<!-- Category Header -->
					<div class="flex items-center space-x-3 mb-6">
						<div class="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
							<Icon icon={category.icon} class="text-orange-600 dark:text-orange-400" width="24" height="24" />
						</div>
						<div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">{category.fields.length} fields in this category</p>
						</div>
						{#if category.name === 'Grid'}
							<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
								NEW
							</span>
						{/if}
					</div>

					<!-- Fields Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{#each category.fields as field}
							<div class="group relative bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all cursor-pointer">
								<!-- Field Icon -->
								<div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 group-hover:border-orange-300 dark:group-hover:border-orange-600 transition-colors">
									<Icon icon={field.icon} class="text-orange-600 dark:text-orange-400" width="24" height="24" />
								</div>
								
								<!-- Field Name -->
								<div class="text-center">
									<h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1">
										{field.name}
									</h4>
									<p class="text-xs text-gray-500 dark:text-gray-400 capitalize">
										{getFieldTypeInfo(field.type).label}
									</p>
								</div>

								<!-- Required Indicator -->
								{#if field.required}
									<div class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" title="Required field"></div>
								{/if}

								<!-- Hover Overlay -->
								<div class="absolute inset-0 bg-orange-600/5 dark:bg-orange-400/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}

		<!-- Action Section -->
		<div class="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to use these fields?</h3>
					<p class="text-gray-600 dark:text-gray-400">
						{data.fieldSet.isCustom 
							? 'Modify this custom field set or use it in your forms' 
							: 'Import this field set to add all fields to your library'}
					</p>
				</div>
				<div class="flex items-center space-x-3">
					{#if data.fieldSet.isCustom}
						<button 
							onclick={editFieldSet}
							class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
						>
							<Icon icon="material-symbols:edit" class="mr-2" width="20" height="20" />
							Edit Field Set
						</button>
					{:else}
						<button 
							onclick={addToForm}
							class="inline-flex items-center px-6 py-3 border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
						>
							<Icon icon="material-symbols:add-circle" class="mr-2" width="20" height="20" />
							Add to Form
						</button>
						<button 
							onclick={importFieldSet}
							class="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
						>
							<Icon icon="material-symbols:download" class="mr-2" width="20" height="20" />
							Import Field Set
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Field Set Tags -->
		{#if data.fieldSet.tags.length > 0}
			<div class="mt-6">
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Tags</h4>
					<div class="flex flex-wrap gap-2">
						{#each data.fieldSet.tags as tag}
							<span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
								#{tag}
							</span>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
