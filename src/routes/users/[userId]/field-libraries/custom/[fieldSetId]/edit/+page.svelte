<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const userId = page.params.userId;
	const fieldSetId = page.params.fieldSetId;

	// State for form (initialized from existing field set)
	let fieldSetName = $state(data.fieldSet.name);
	let fieldSetDescription = $state(data.fieldSet.description);
	let selectedFields = $state([...data.fieldSet.selectedFields]);

	// Helper functions
	function toggleField(fieldId: string) {
		if (selectedFields.includes(fieldId)) {
			selectedFields = selectedFields.filter(id => id !== fieldId);
		} else {
			selectedFields = [...selectedFields, fieldId];
		}
	}

	function isFieldSelected(fieldId: string) {
		return selectedFields.includes(fieldId);
	}

	function updateFieldSet() {
		if (!fieldSetName.trim()) {
			alert('Please enter a field set name');
			return;
		}
		
		if (selectedFields.length === 0) {
			alert('Please select at least one field');
			return;
		}

		console.log('Updating field set:', {
			id: fieldSetId,
			name: fieldSetName,
			description: fieldSetDescription,
			fields: selectedFields
		});

		// Navigate back to field library
		window.location.href = `/users/${userId}/field-libraries`;
	}

	function deleteFieldSet() {
		if (confirm('Are you sure you want to delete this field set? This action cannot be undone.')) {
			console.log('Deleting field set:', fieldSetId);
			// Navigate back to field library
			window.location.href = `/users/${userId}/field-libraries`;
		}
	}

	function goBack() {
		window.location.href = `/users/${userId}/field-libraries/${fieldSetId}`;
	}

	function selectAllInCategory(categoryFields: any[]) {
		const categoryFieldIds = categoryFields.map(f => f.id);
		const allSelected = categoryFieldIds.every(id => selectedFields.includes(id));
		
		if (allSelected) {
			// Deselect all in category
			selectedFields = selectedFields.filter(id => !categoryFieldIds.includes(id));
		} else {
			// Select all in category
			const newIds = categoryFieldIds.filter(id => !selectedFields.includes(id));
			selectedFields = [...selectedFields, ...newIds];
		}
	}

	function areAllCategoryFieldsSelected(categoryFields: any[]) {
		return categoryFields.every(field => selectedFields.includes(field.id));
	}
</script>

<svelte:head>
	<title>Edit {data.fieldSet.name} - Field Library</title>
</svelte:head>

<div class="w-full bg-gray-50 dark:bg-gray-900">
	<!-- Header Section -->
	<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<button 
						onclick={goBack}
						class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						title="Back to Field Set"
					>
						<Icon icon="material-symbols:arrow-back" width="24" height="24" />
					</button>
					<div>
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
							Edit {data.fieldSet.name}
						</h1>
						<p class="text-gray-600 dark:text-gray-400 mt-1">
							Modify your custom field collection
						</p>
					</div>
				</div>
				<div class="flex items-center space-x-3">
					<button 
						onclick={deleteFieldSet}
						class="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
					>
						<Icon icon="material-symbols:delete" class="mr-2" width="20" height="20" />
						Delete
					</button>
					<button 
						onclick={updateFieldSet}
						class="inline-flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
						disabled={!fieldSetName.trim() || selectedFields.length === 0}
					>
						<Icon icon="material-symbols:save" class="mr-2" width="20" height="20" />
						Save Changes
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Form Configuration Panel -->
			<div class="lg:col-span-1">
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Field Set Configuration</h3>
					
					<!-- Field Set Name -->
					<div class="mb-4">
						<label for="editFieldSetName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Field Set Name *
						</label>
						<input
							id="editFieldSetName"
							bind:value={fieldSetName}
							type="text"
							placeholder="Enter field set name..."
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						/>
					</div>

					<!-- Field Set Description -->
					<div class="mb-4">
						<label for="editFieldSetDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Description
						</label>
						<textarea
							id="editFieldSetDescription"
							bind:value={fieldSetDescription}
							placeholder="Describe your field set..."
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						></textarea>
					</div>

					<!-- Selected Fields Summary -->
					<div class="mb-6">
						<div class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Selected Fields ({selectedFields.length})
						</div>
						<div class="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
							{#if selectedFields.length > 0}
								<div class="space-y-2">
									{#each selectedFields as fieldId}
										{@const field = data.basicFieldTypes.flatMap(cat => cat.fields).find(f => f.id === fieldId)}
										{#if field}
											<div class="flex items-center justify-between text-sm">
												<span class="text-gray-900 dark:text-white">{field.name}</span>
												<button 
													onclick={() => toggleField(fieldId)}
													class="text-red-600 hover:text-red-700 p-1"
													title="Remove field"
												>
													<Icon icon="material-symbols:close" width="16" height="16" />
												</button>
											</div>
										{/if}
									{/each}
								</div>
							{:else}
								<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
									No fields selected yet
								</p>
							{/if}
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="space-y-3">
						<button 
							onclick={updateFieldSet}
							class="w-full inline-flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!fieldSetName.trim() || selectedFields.length === 0}
						>
							<Icon icon="material-symbols:save" class="mr-2" width="20" height="20" />
							Save Changes
						</button>
						
						<button 
							onclick={deleteFieldSet}
							class="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
						>
							<Icon icon="material-symbols:delete" class="mr-2" width="20" height="20" />
							Delete Field Set
						</button>
					</div>
				</div>
			</div>

			<!-- Field Selection Panel -->
			<div class="lg:col-span-2">
				<div class="space-y-6">
					{#each data.basicFieldTypes as category}
						<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
							<!-- Category Header -->
							<div class="flex items-center justify-between mb-6">
								<div class="flex items-center space-x-3">
									<h3 class="text-lg font-semibold text-gray-900 dark:text-white">{category.category}</h3>
									{#if category.isNew}
										<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
											NEW
										</span>
									{/if}
								</div>
								<button
									onclick={() => selectAllInCategory(category.fields)}
									class="text-sm text-orange-600 hover:text-orange-700 font-medium"
								>
									{areAllCategoryFieldsSelected(category.fields) ? 'Deselect All' : 'Select All'}
								</button>
							</div>

							<!-- Fields Grid -->
							<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
								{#each category.fields as field}
									<button 
										class="group relative bg-gray-50 dark:bg-gray-700 border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md w-full {
											isFieldSelected(field.id) 
												? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
												: 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
										}"
										onclick={() => toggleField(field.id)}
									>
										<!-- Selection Indicator -->
										{#if isFieldSelected(field.id)}
											<div class="absolute top-2 right-2 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center">
												<Icon icon="material-symbols:check" width="16" height="16" />
											</div>
										{/if}

										<!-- Field Icon -->
										<div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 transition-colors {
											isFieldSelected(field.id) ? 'border-orange-400' : 'group-hover:border-orange-300'
										}">
											<Icon icon={field.icon} class="text-orange-600 dark:text-orange-400" width="24" height="24" />
										</div>
										
										<!-- Field Info -->
										<div class="text-center">
											<h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1">
												{field.name}
											</h4>
											<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
												{field.description}
											</p>
											<span class="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs capitalize">
												{field.type}
											</span>
										</div>
									</button>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
