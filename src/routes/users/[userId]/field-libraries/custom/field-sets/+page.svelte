<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';

	const userId = page.params.userId;

	// State for field set creation
	let fieldSetName = $state('');
	let fieldSetDescription = $state('');
	let selectedCustomFields = $state<string[]>([]);

	// Mock available custom fields (these would come from user's created custom fields)
	const availableCustomFields = [
		{ 
			id: 'custom-patient-info', 
			name: 'Patient Information', 
			description: 'Comprehensive patient data collection with name, DOB, and contact details',
			components: ['text-single', 'datetime-date', 'text-single', 'selection-dropdown'],
			layout: 'layout-2-column',
			icon: 'material-symbols:medical-services'
		},
		{ 
			id: 'custom-contact-form', 
			name: 'Contact Details', 
			description: 'Complete contact information including address and preferences',
			components: ['text-single', 'text-single', 'text-multi', 'selection-checkbox'],
			layout: 'layout-1-column',
			icon: 'material-symbols:contact-page'
		},
		{ 
			id: 'custom-event-registration', 
			name: 'Event Registration', 
			description: 'Event details with attendee count and special requirements',
			components: ['text-single', 'datetime-date', 'number-integer', 'text-multi'],
			layout: 'layout-2-column',
			icon: 'material-symbols:event'
		}
	];

	// Helper functions
	function toggleCustomField(fieldId: string) {
		if (selectedCustomFields.includes(fieldId)) {
			selectedCustomFields = selectedCustomFields.filter(id => id !== fieldId);
		} else {
			selectedCustomFields = [...selectedCustomFields, fieldId];
		}
	}

	function isCustomFieldSelected(fieldId: string) {
		return selectedCustomFields.includes(fieldId);
	}

	function saveFieldSet() {
		if (!fieldSetName.trim()) {
			alert('Please enter a field set name');
			return;
		}
		
		if (selectedCustomFields.length === 0) {
			alert('Please select at least one custom field');
			return;
		}

		console.log('Creating field set:', {
			name: fieldSetName,
			description: fieldSetDescription,
			customFields: selectedCustomFields
		});

		// Navigate back to field library
		window.location.href = `/users/${userId}/field-libraries`;
	}

	function goBack() {
		window.location.href = `/users/${userId}/field-libraries`;
	}

	function createNewCustomField() {
		window.location.href = `/users/${userId}/field-libraries/custom/new`;
	}

	function editCustomField(fieldId: string) {
		window.location.href = `/users/${userId}/field-libraries/custom/${fieldId}/edit`;
	}

	function getLayoutInfo(layoutId: string) {
		const layouts: Record<string, { name: string; icon: string; columns: number }> = {
			'layout-1-column': { name: '1-Column', icon: 'material-symbols:view-agenda', columns: 1 },
			'layout-2-column': { name: '2-Column', icon: 'material-symbols:view-column', columns: 2 },
			'layout-3-column': { name: '3-Column', icon: 'material-symbols:view-module', columns: 3 }
		};
		return layouts[layoutId] || layouts['layout-1-column'];
	}
</script>

<svelte:head>
	<title>Create Field Set - Field Library</title>
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
						title="Back to Field Library"
					>
						<Icon icon="material-symbols:arrow-back" width="24" height="24" />
					</button>
					<div>
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
							Create Field Set
						</h1>
						<p class="text-gray-600 dark:text-gray-400 mt-1">
							Build a field set by combining your custom fields
						</p>
					</div>
				</div>
				<div class="flex items-center space-x-3">
					<button 
						onclick={createNewCustomField}
						class="inline-flex items-center px-4 py-2 border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
					>
						<Icon icon="material-symbols:add" class="mr-2" width="20" height="20" />
						Create Custom Field
					</button>
					<button 
						onclick={saveFieldSet}
						class="inline-flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
						disabled={!fieldSetName.trim() || selectedCustomFields.length === 0}
					>
						<Icon icon="material-symbols:save" class="mr-2" width="20" height="20" />
						Save Field Set
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Field Set Configuration Panel -->
			<div class="lg:col-span-1">
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Field Set Configuration</h3>
					
					<!-- Field Set Name -->
					<div class="mb-4">
						<label for="fieldSetName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Field Set Name *
						</label>
						<input
							id="fieldSetName"
							bind:value={fieldSetName}
							type="text"
							placeholder="e.g., Healthcare Intake, Customer Registration..."
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						/>
					</div>

					<!-- Field Set Description -->
					<div class="mb-4">
						<label for="fieldSetDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Description
						</label>
						<textarea
							id="fieldSetDescription"
							bind:value={fieldSetDescription}
							placeholder="Describe what this field set is used for..."
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						></textarea>
					</div>

					<!-- Selected Custom Fields Summary -->
					<div class="mb-6">
						<div class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Selected Custom Fields ({selectedCustomFields.length})
						</div>
						<div class="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
							{#if selectedCustomFields.length > 0}
								<div class="space-y-2">
									{#each selectedCustomFields as fieldId}
										{@const field = availableCustomFields.find(f => f.id === fieldId)}
										{#if field}
											<div class="flex items-center justify-between text-sm">
												<div class="flex items-center space-x-2">
													<Icon icon={field.icon} width="14" height="14" class="text-orange-600" />
													<span class="text-gray-900 dark:text-white">{field.name}</span>
												</div>
												<button 
													onclick={() => toggleCustomField(fieldId)}
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
									No custom fields selected yet
								</p>
							{/if}
						</div>
					</div>

					<!-- Save Button -->
					<button 
						onclick={saveFieldSet}
						class="w-full inline-flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!fieldSetName.trim() || selectedCustomFields.length === 0}
					>
						<Icon icon="material-symbols:save" class="mr-2" width="20" height="20" />
						Save Field Set
					</button>
				</div>
			</div>

			<!-- Custom Fields Selection Panel -->
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<div class="flex items-center justify-between mb-6">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Your Custom Fields</h3>
						<button 
							onclick={createNewCustomField}
							class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
						>
							<Icon icon="material-symbols:add" class="mr-2" width="16" height="16" />
							Create New Custom Field
						</button>
					</div>

					{#if availableCustomFields.length > 0}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							{#each availableCustomFields as field}
								<div class="bg-gray-50 dark:bg-gray-700 border-2 rounded-lg p-6 transition-all hover:shadow-md {
									isCustomFieldSelected(field.id) 
										? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
										: 'border-gray-200 dark:border-gray-600 hover:border-orange-300'
								}">
									<!-- Selection Indicator -->
									{#if isCustomFieldSelected(field.id)}
										<div class="absolute top-4 right-4 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center">
											<Icon icon="material-symbols:check" width="16" height="16" />
										</div>
									{/if}

									<!-- Custom Field Header -->
									<div class="flex items-center space-x-3 mb-4">
										<div class="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg">
											<Icon icon={field.icon} class="text-orange-600" width="24" height="24" />
										</div>
										<div class="flex-1">
											<h4 class="font-semibold text-gray-900 dark:text-white">{field.name}</h4>
											<div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
												<Icon icon={getLayoutInfo(field.layout).icon} width="12" height="12" />
												<span>{getLayoutInfo(field.layout).name}</span>
												<span>•</span>
												<span>{field.components.length} components</span>
											</div>
										</div>
									</div>

									<!-- Custom Field Description -->
									<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
										{field.description}
									</p>

									<!-- Components Preview -->
									<div class="mb-4">
										<div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Components:</div>
										<div class="flex flex-wrap gap-1">
											{#each field.components.slice(0, 4) as componentId}
												{@const component = {
													'text-single': { name: 'Single Text' },
													'datetime-date': { name: 'Date' },
													'number-integer': { name: 'Number' },
													'text-multi': { name: 'Multi Text' },
													'selection-multi': { name: 'Multi Choice' },
													'selection-dropdown': { name: 'Dropdown' },
													'number-decimal': { name: 'Decimal' }
												}[componentId]}
												{#if component}
													<span class="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
														{component.name}
													</span>
												{/if}
											{/each}
											{#if field.components.length > 4}
												<span class="px-2 py-1 bg-gray-300 dark:bg-gray-500 text-gray-600 dark:text-gray-400 rounded text-xs">
													+{field.components.length - 4} more
												</span>
											{/if}
										</div>
									</div>

									<!-- Actions -->
									<div class="flex gap-2">
										<button
											onclick={() => toggleCustomField(field.id)}
											class="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
										>
											{isCustomFieldSelected(field.id) ? 'Remove' : 'Add to Set'}
										</button>
										<button
											onclick={() => editCustomField(field.id)}
											class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
											title="Edit custom field"
										>
											<Icon icon="material-symbols:edit" width="16" height="16" />
										</button>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-12">
							<Icon icon="material-symbols:text-fields" class="mx-auto text-gray-400 mb-4" width="48" height="48" />
							<h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Custom Fields Yet</h4>
							<p class="text-gray-500 dark:text-gray-400 mb-4">
								Create your first custom field to start building field sets
							</p>
							<button 
								onclick={createNewCustomField}
								class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
							>
								<Icon icon="material-symbols:add" class="mr-2" width="20" height="20" />
								Create Custom Field
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
