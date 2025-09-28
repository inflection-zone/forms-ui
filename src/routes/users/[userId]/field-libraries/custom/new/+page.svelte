<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';

	const userId = page.params.userId;

	// State for custom field creation
	let customFieldName = $state('');
	let customFieldDescription = $state('');
	let selectedLayout = $state('layout-1-column');
	let selectedBasicFields = $state<string[]>([]);
	let fieldArrangement = $state<string[]>([]);

	// Available basic field types - these are the building blocks for custom fields
	const basicFieldTypes = [
		{
			category: 'Grid Layout',
			isNew: true,
			description: 'Choose how your custom field will be arranged',
			fields: [
				{ id: 'layout-1-column', name: '1-Column', type: 'layout', icon: 'material-symbols:view-agenda', description: 'Single column layout' },
				{ id: 'layout-2-column', name: '2-Column', type: 'layout', icon: 'material-symbols:view-column', description: 'Two column layout' },
				{ id: 'layout-3-column', name: '3-Column', type: 'layout', icon: 'material-symbols:view-module', description: 'Three column layout' }
			]
		},
		{
			category: 'Text Input',
			isNew: false,
			description: 'Text input components for your custom field',
			fields: [
				{ id: 'text-single', name: 'Single Line Text', type: 'text', icon: 'material-symbols:text-fields', description: 'Single line text input' },
				{ id: 'text-multi', name: 'Multi Line Text', type: 'textarea', icon: 'material-symbols:notes', description: 'Multi-line text area' }
			]
		},
		{
			category: 'Number Input',
			isNew: false,
			description: 'Numeric input components',
			fields: [
				{ id: 'number-integer', name: 'Number', type: 'number', icon: 'material-symbols:123', description: 'Integer number input' },
				{ id: 'number-decimal', name: 'Decimal', type: 'decimal', icon: 'material-symbols:decimal-increase', description: 'Decimal number input' },
				{ id: 'number-range', name: 'Range', type: 'range', icon: 'material-symbols:tune', description: 'Range slider input' }
			]
		},
		{
			category: 'Selection',
			isNew: false,
			description: 'Choice and selection components',
			fields: [
				{ id: 'selection-checkbox', name: 'Checkbox', type: 'checkbox', icon: 'material-symbols:check-box', description: 'Multiple selection checkboxes' },
				{ id: 'selection-switch', name: 'Switch', type: 'switch', icon: 'material-symbols:toggle-on', description: 'Toggle switch' },
				{ id: 'selection-single', name: 'Single Choice', type: 'radio', icon: 'material-symbols:radio-button-checked', description: 'Single selection radio buttons' },
				{ id: 'selection-multi', name: 'Multi Choice', type: 'checkbox-group', icon: 'material-symbols:checklist', description: 'Multiple choice checkboxes' },
				{ id: 'selection-dropdown', name: 'Select Dropdown', type: 'select', icon: 'material-symbols:arrow-drop-down', description: 'Dropdown selection' },
				{ id: 'selection-multi-select', name: 'Multi-Select', type: 'multi-select', icon: 'material-symbols:format-list-bulleted', description: 'Multiple selection dropdown' }
			]
		},
		{
			category: 'Date & Time',
			isNew: false,
			description: 'Date and time input components',
			fields: [
				{ id: 'datetime-date', name: 'Date', type: 'date', icon: 'material-symbols:calendar-today', description: 'Date picker' },
				{ id: 'datetime-time', name: 'Time', type: 'time', icon: 'material-symbols:schedule', description: 'Time picker' },
				{ id: 'datetime-datetime', name: 'Date & Time', type: 'datetime-local', icon: 'material-symbols:event', description: 'Date and time picker' }
			]
		},
		{
			category: 'Interactive',
			isNew: false,
			description: 'Advanced interactive components',
			fields: [
				{ id: 'interactive-rating', name: 'Rating', type: 'rating', icon: 'material-symbols:star', description: 'Star rating input' },
				{ id: 'interactive-color', name: 'Color', type: 'color', icon: 'material-symbols:palette', description: 'Color picker' },
				{ id: 'interactive-file', name: 'File Upload', type: 'file', icon: 'material-symbols:upload-file', description: 'File upload field' },
				{ id: 'interactive-image', name: 'Image Upload', type: 'image', icon: 'material-symbols:image', description: 'Image upload field' }
			]
		}
	];

	// Helper functions
	function addBasicField(fieldId: string) {
		if (!selectedBasicFields.includes(fieldId)) {
			selectedBasicFields = [...selectedBasicFields, fieldId];
			fieldArrangement = [...fieldArrangement, fieldId];
		}
	}

	function removeBasicField(fieldId: string) {
		selectedBasicFields = selectedBasicFields.filter(id => id !== fieldId);
		fieldArrangement = fieldArrangement.filter(id => id !== fieldId);
	}

	function isFieldSelected(fieldId: string) {
		return selectedBasicFields.includes(fieldId);
	}

	function moveFieldUp(index: number) {
		if (index > 0) {
			const newArrangement = [...fieldArrangement];
			[newArrangement[index - 1], newArrangement[index]] = [newArrangement[index], newArrangement[index - 1]];
			fieldArrangement = newArrangement;
		}
	}

	function moveFieldDown(index: number) {
		if (index < fieldArrangement.length - 1) {
			const newArrangement = [...fieldArrangement];
			[newArrangement[index], newArrangement[index + 1]] = [newArrangement[index + 1], newArrangement[index]];
			fieldArrangement = newArrangement;
		}
	}

	function saveCustomField() {
		if (!customFieldName.trim()) {
			alert('Please enter a custom field name');
			return;
		}
		
		if (selectedBasicFields.length === 0) {
			alert('Please select at least one basic field component');
			return;
		}

		console.log('Creating custom field:', {
			name: customFieldName,
			description: customFieldDescription,
			layout: selectedLayout,
			basicFields: selectedBasicFields,
			arrangement: fieldArrangement
		});

		// Navigate back to field library
		window.location.href = `/users/${userId}/field-libraries`;
	}

	function goBack() {
		window.location.href = `/users/${userId}/field-libraries`;
	}

	function getLayoutIcon(layoutId: string) {
		const layout = basicFieldTypes[0].fields.find(f => f.id === layoutId);
		return layout?.icon || 'material-symbols:view-agenda';
	}

	function getLayoutName(layoutId: string) {
		const layout = basicFieldTypes[0].fields.find(f => f.id === layoutId);
		return layout?.name || '1-Column';
	}
</script>

<svelte:head>
	<title>Create Custom Field - Field Library</title>
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
							Create Custom Field
						</h1>
						<p class="text-gray-600 dark:text-gray-400 mt-1">
							Build a custom field by combining basic field components
						</p>
					</div>
				</div>
				<button 
					onclick={saveCustomField}
					class="inline-flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
					disabled={!customFieldName.trim() || selectedBasicFields.length === 0}
				>
					<Icon icon="material-symbols:save" class="mr-2" width="20" height="20" />
					Save Custom Field
				</button>
			</div>
		</div>
	</div>

	<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
			<!-- Custom Field Configuration Panel -->
			<div class="xl:col-span-1">
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Field Configuration</h3>
					
					<!-- Custom Field Name -->
					<div class="mb-4">
						<label for="customFieldName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Custom Field Name *
						</label>
						<input
							id="customFieldName"
							bind:value={customFieldName}
							type="text"
							placeholder="e.g., Patient Information, Contact Details..."
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						/>
					</div>

					<!-- Custom Field Description -->
					<div class="mb-4">
						<label for="customFieldDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Description
						</label>
						<textarea
							id="customFieldDescription"
							bind:value={customFieldDescription}
							placeholder="Describe what this custom field will collect..."
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						></textarea>
					</div>

					<!-- Layout Selection -->
					<div class="mb-6">
						<label for="layoutSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Layout Style *
						</label>
						<select
							id="layoutSelect"
							bind:value={selectedLayout}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						>
							{#each basicFieldTypes[0].fields as layout}
								<option value={layout.id}>{layout.name}</option>
							{/each}
						</select>
						<div class="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
							<Icon icon={getLayoutIcon(selectedLayout)} class="mr-2" width="16" height="16" />
							{getLayoutName(selectedLayout)} layout selected
						</div>
					</div>

					<!-- Field Arrangement -->
					<div class="mb-6">
						<div class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Field Arrangement ({fieldArrangement.length})
						</div>
						<div class="max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
							{#if fieldArrangement.length > 0}
								<div class="space-y-2">
									{#each fieldArrangement as fieldId, index}
										{@const field = basicFieldTypes.flatMap(cat => cat.fields).find(f => f.id === fieldId)}
										{#if field}
											<div class="flex items-center justify-between text-sm bg-white dark:bg-gray-600 p-2 rounded">
												<div class="flex items-center space-x-2">
													<Icon icon={field.icon} width="14" height="14" class="text-orange-600" />
													<span class="text-gray-900 dark:text-white">{field.name}</span>
												</div>
												<div class="flex items-center space-x-1">
													<button 
														onclick={() => moveFieldUp(index)}
														class="text-gray-400 hover:text-gray-600 p-1"
														disabled={index === 0}
														title="Move up"
													>
														<Icon icon="material-symbols:keyboard-arrow-up" width="14" height="14" />
													</button>
													<button 
														onclick={() => moveFieldDown(index)}
														class="text-gray-400 hover:text-gray-600 p-1"
														disabled={index === fieldArrangement.length - 1}
														title="Move down"
													>
														<Icon icon="material-symbols:keyboard-arrow-down" width="14" height="14" />
													</button>
													<button 
														onclick={() => removeBasicField(fieldId)}
														class="text-red-600 hover:text-red-700 p-1"
														title="Remove field"
													>
														<Icon icon="material-symbols:close" width="14" height="14" />
													</button>
												</div>
											</div>
										{/if}
									{/each}
								</div>
							{:else}
								<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
									Add basic field components below to build your custom field
								</p>
							{/if}
						</div>
					</div>

					<!-- Save Button -->
					<button 
						onclick={saveCustomField}
						class="w-full inline-flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!customFieldName.trim() || selectedBasicFields.length === 0}
					>
						<Icon icon="material-symbols:save" class="mr-2" width="20" height="20" />
						Save Custom Field
					</button>
				</div>
			</div>

			<!-- Basic Field Components Panel -->
			<div class="xl:col-span-3">
				<div class="space-y-6">
					<!-- Layout Selection Section -->
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
						<div class="flex items-center space-x-3 mb-4">
							<Icon icon="material-symbols:view-module" class="text-red-600" width="24" height="24" />
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Step 1: Choose Layout</h3>
							<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
								NEW
							</span>
						</div>
						<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
							Select how your basic field components will be arranged in your custom field
						</p>
						
						<div class="grid grid-cols-3 gap-4">
							{#each basicFieldTypes[0].fields as layout}
								<button 
									class="p-4 border-2 rounded-lg transition-all hover:shadow-md {
										selectedLayout === layout.id 
											? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
											: 'border-gray-200 dark:border-gray-600 hover:border-orange-300'
									}"
									onclick={() => selectedLayout = layout.id}
								>
									<div class="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-white dark:bg-gray-600 rounded-lg">
										<Icon icon={layout.icon} class="text-orange-600" width="24" height="24" />
									</div>
									<div class="text-center">
										<h4 class="font-medium text-gray-900 dark:text-white text-sm">{layout.name}</h4>
									</div>
								</button>
							{/each}
						</div>
					</div>

					<!-- Basic Field Components Selection -->
					{#each basicFieldTypes.slice(1) as category}
						<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
							<!-- Category Header -->
							<div class="flex items-center space-x-3 mb-4">
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
									{category.category} Components
								</h3>
							</div>
							<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
								{category.description}
							</p>

							<!-- Fields Grid -->
							<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{#each category.fields as field}
									<div class="group relative bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all">
										<!-- Field Icon -->
										<div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
											<Icon icon={field.icon} class="text-orange-600 dark:text-orange-400" width="24" height="24" />
										</div>
										
										<!-- Field Info -->
										<div class="text-center mb-3">
											<h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1">
												{field.name}
											</h4>
											<p class="text-xs text-gray-500 dark:text-gray-400">
												{field.description}
											</p>
										</div>

										<!-- Add Button -->
										<button
											onclick={() => addBasicField(field.id)}
											class="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
											disabled={isFieldSelected(field.id)}
										>
											{isFieldSelected(field.id) ? 'Added' : 'Add Component'}
										</button>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Custom Field Preview -->
		{#if selectedBasicFields.length > 0}
			<div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mt-8">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Field Preview</h3>
				<div class="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
					<div class="flex items-center space-x-3 mb-4">
						<Icon icon={getLayoutIcon(selectedLayout)} class="text-orange-600" width="20" height="20" />
						<h4 class="font-semibold text-gray-900 dark:text-white">
							{customFieldName || 'Untitled Custom Field'}
						</h4>
						<span class="text-xs text-gray-500 dark:text-gray-400">({getLayoutName(selectedLayout)})</span>
					</div>
					
					<div class="grid gap-4 {
						selectedLayout === 'layout-1-column' ? 'grid-cols-1' :
						selectedLayout === 'layout-2-column' ? 'grid-cols-2' :
						'grid-cols-3'
					}">
						{#each fieldArrangement as fieldId}
							{@const field = basicFieldTypes.flatMap(cat => cat.fields).find(f => f.id === fieldId)}
							{#if field}
								<div class="flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-600 rounded border-l-4 border-orange-500">
									<Icon icon={field.icon} width="16" height="16" class="text-orange-600" />
									<span class="text-sm text-gray-900 dark:text-white">{field.name}</span>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>