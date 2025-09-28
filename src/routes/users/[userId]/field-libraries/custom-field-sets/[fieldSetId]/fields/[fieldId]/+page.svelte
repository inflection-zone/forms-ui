<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';

	const userId = page.params.userId;
	const fieldSetId = page.params.fieldSetId;
	const fieldId = page.params.fieldId;

	interface SubField {
		id: string;
		name: string;
		type: string;
		sequence: number;
		validationRules: {
			required: boolean;
			minLength?: number;
			maxLength?: number;
			pattern?: string;
			min?: number;
			max?: number;
		};
	}

	interface CustomField {
		id: string;
		name: string;
		description: string;
		tags: string[];
		columns: number;
		icon: string;
		subFields: SubField[];
		createdAt: string;
		updatedAt: string;
	}

	// Mock data - in real app this would be loaded based on fieldId
	let customField = $state<CustomField>({
		id: fieldId,
		name: 'Complete Address',
		description: 'Full address collection with validation for street, city, state, and postal code',
		tags: ['address', 'location', 'contact'],
		columns: 2,
		icon: 'material-symbols:location-on',
		subFields: [
			{
				id: 'street',
				name: 'Street Address',
				type: 'text',
				sequence: 1,
				validationRules: { required: true, minLength: 5, maxLength: 100 }
			},
			{
				id: 'city',
				name: 'City',
				type: 'text',
				sequence: 2,
				validationRules: { required: true, minLength: 2, maxLength: 50 }
			},
			{
				id: 'state',
				name: 'State/Province',
				type: 'select',
				sequence: 3,
				validationRules: { required: true }
			},
			{
				id: 'postal',
				name: 'Postal Code',
				type: 'text',
				sequence: 4,
				validationRules: { required: true, pattern: '^[0-9]{5}(-[0-9]{4})?$' }
			}
		],
		createdAt: '2024-01-20T10:00:00Z',
		updatedAt: '2024-01-25T15:30:00Z'
	});

	let currentTag = $state('');
	let showPreview = $state(false);

	// Available basic field types for sub-fields
	const basicFieldTypes = [
		{ id: 'text', name: 'Single Line Text', icon: 'material-symbols:text-fields' },
		{ id: 'textarea', name: 'Multi Line Text', icon: 'material-symbols:notes' },
		{ id: 'email', name: 'Email', icon: 'material-symbols:email' },
		{ id: 'tel', name: 'Phone', icon: 'material-symbols:phone' },
		{ id: 'number', name: 'Number', icon: 'material-symbols:numbers' },
		{ id: 'date', name: 'Date', icon: 'material-symbols:calendar-today' },
		{ id: 'select', name: 'Dropdown', icon: 'material-symbols:arrow-drop-down' },
		{ id: 'checkbox', name: 'Checkbox', icon: 'material-symbols:check-box' },
		{ id: 'radio', name: 'Radio Button', icon: 'material-symbols:radio-button-checked' }
	];

	// Available icons for custom fields
	const availableIcons = [
		'material-symbols:text-fields',
		'material-symbols:person',
		'material-symbols:location-on',
		'material-symbols:email',
		'material-symbols:phone',
		'material-symbols:business',
		'material-symbols:home',
		'material-symbols:work',
		'material-symbols:medical-services',
		'material-symbols:school',
		'material-symbols:event',
		'material-symbols:shopping-cart',
		'material-symbols:credit-card',
		'material-symbols:star',
		'material-symbols:favorite',
		'material-symbols:settings'
	];

	// Functions
	function addTag() {
		if (currentTag.trim() && !customField.tags.includes(currentTag.trim())) {
			customField.tags = [...customField.tags, currentTag.trim()];
			currentTag = '';
		}
	}

	function removeTag(index: number) {
		customField.tags = customField.tags.filter((_, i) => i !== index);
	}

	function addSubField() {
		const newSubField: SubField = {
			id: `sub-field-${Date.now()}`,
			name: '',
			type: 'text',
			sequence: customField.subFields.length + 1,
			validationRules: {
				required: false
			}
		};
		customField.subFields = [...customField.subFields, newSubField];
	}

	function removeSubField(index: number) {
		customField.subFields = customField.subFields.filter((_, i) => i !== index);
		// Reorder sequences
		customField.subFields.forEach((field, i) => {
			field.sequence = i + 1;
		});
	}

	function moveSubField(index: number, direction: 'up' | 'down') {
		const newFields = [...customField.subFields];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		
		if (targetIndex >= 0 && targetIndex < newFields.length) {
			[newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
			// Update sequences
			newFields.forEach((field, i) => {
				field.sequence = i + 1;
			});
			customField.subFields = newFields;
		}
	}

	function saveCustomField() {
		if (!customField.name.trim()) {
			alert('Please enter a custom field name');
			return;
		}
		
		if (customField.subFields.length === 0) {
			alert('Please add at least one sub-field');
			return;
		}

		// Validate all sub-fields have names
		const hasEmptyNames = customField.subFields.some(field => !field.name.trim());
		if (hasEmptyNames) {
			alert('Please provide names for all sub-fields');
			return;
		}

		console.log('Updating custom field:', customField);
		
		// Navigate back to fields list
		window.location.href = `/users/${userId}/field-libraries/custom-field-sets/${fieldSetId}/fields`;
	}

	function deleteCustomField() {
		if (confirm('Are you sure you want to delete this custom field? This action cannot be undone.')) {
			console.log('Deleting custom field:', fieldId);
			// Navigate back to fields list
			window.location.href = `/users/${userId}/field-libraries/custom-field-sets/${fieldSetId}/fields`;
		}
	}

	function goBack() {
		window.location.href = `/users/${userId}/field-libraries/custom-field-sets/${fieldSetId}/fields`;
	}

	function getFieldTypeInfo(type: string) {
		return basicFieldTypes.find(ft => ft.id === type) || basicFieldTypes[0];
	}
</script>

<svelte:head>
	<title>Edit {customField.name} - Field Library</title>
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
						title="Back to Fields List"
					>
						<Icon icon="material-symbols:arrow-back" width="24" height="24" />
					</button>
					<div>
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
							Edit {customField.name}
						</h1>
						<p class="text-gray-600 dark:text-gray-400 mt-1">
							Modify your custom field configuration
						</p>
					</div>
				</div>
				<div class="flex items-center space-x-3">
					<button 
						onclick={() => showPreview = !showPreview}
						class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
					>
						<Icon icon="material-symbols:preview" class="mr-2" width="20" height="20" />
						{showPreview ? 'Hide Preview' : 'Show Preview'}
					</button>
					<button 
						onclick={deleteCustomField}
						class="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
					>
						<Icon icon="material-symbols:delete" class="mr-2" width="20" height="20" />
						Delete
					</button>
					<button 
						onclick={saveCustomField}
						class="inline-flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
						disabled={!customField.name.trim() || customField.subFields.length === 0}
					>
						<Icon icon="material-symbols:save" class="mr-2" width="20" height="20" />
						Save Changes
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 {showPreview ? 'lg:grid-cols-2' : ''} gap-8">
			<!-- Configuration Panel -->
			<div>
				<div class="space-y-6">
					<!-- Basic Information -->
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
						
						<!-- Custom Field Name -->
						<div class="mb-4">
							<label for="customFieldName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Custom Field Name *
							</label>
							<input
								id="customFieldName"
								bind:value={customField.name}
								type="text"
								placeholder="e.g., Address, Patient Information, Contact Details..."
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							/>
						</div>

						<!-- Description -->
						<div class="mb-4">
							<label for="customFieldDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Description
							</label>
							<textarea
								id="customFieldDescription"
								bind:value={customField.description}
								placeholder="Describe what this custom field is used for..."
								rows="3"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							></textarea>
						</div>

						<!-- Layout Configuration -->
						<div class="grid grid-cols-2 gap-4 mb-4">
							<!-- Number of Columns -->
							<div>
								<label for="columns" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Number of Columns
								</label>
								<select
									id="columns"
									bind:value={customField.columns}
									class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
								>
									<option value={1}>1 Column</option>
									<option value={2}>2 Columns</option>
									<option value={3}>3 Columns</option>
								</select>
							</div>

							<!-- Icon Selection -->
							<div>
								<label for="icon" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Icon
								</label>
								<select
									id="icon"
									bind:value={customField.icon}
									class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
								>
									{#each availableIcons as iconId}
										<option value={iconId}>{iconId.replace('material-symbols:', '').replace('-', ' ')}</option>
									{/each}
								</select>
							</div>
						</div>

						<!-- Tags -->
						<div>
							<label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Tags
							</label>
							<div class="flex space-x-2 mb-2">
								<input
									id="tags"
									bind:value={currentTag}
									type="text"
									placeholder="Add a tag..."
									class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
									onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
								/>
								<button
									onclick={addTag}
									class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
									disabled={!currentTag.trim()}
								>
									Add
								</button>
							</div>
							{#if customField.tags.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each customField.tags as tag, index}
										<span class="inline-flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm">
											#{tag}
											<button
												onclick={() => removeTag(index)}
												class="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
											>
												<Icon icon="material-symbols:close" width="14" height="14" />
											</button>
										</span>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<!-- Sub-Fields Management -->
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Sub-Fields ({customField.subFields.length})</h3>
							<button
								onclick={addSubField}
								class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
							>
								<Icon icon="material-symbols:add" class="mr-2" width="16" height="16" />
								Add Sub-Field
							</button>
						</div>

						{#if customField.subFields.length === 0}
							<div class="text-center py-8">
								<Icon icon="material-symbols:text-fields" class="mx-auto text-gray-400 mb-3" width="48" height="48" />
								<p class="text-gray-500 dark:text-gray-400 mb-4">No sub-fields configured</p>
								<button
									onclick={addSubField}
									class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
								>
									<Icon icon="material-symbols:add" class="mr-2" width="20" height="20" />
									Add Your First Sub-Field
								</button>
							</div>
						{:else}
							<div class="space-y-4">
								{#each customField.subFields as subField, index}
									<div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
										<div class="flex items-center justify-between mb-3">
											<div class="flex items-center space-x-2">
												<span class="text-sm font-medium text-gray-500 dark:text-gray-400">#{subField.sequence}</span>
												<Icon icon={getFieldTypeInfo(subField.type).icon} class="text-orange-600" width="20" height="20" />
											</div>
											<div class="flex items-center space-x-2">
												<button
													onclick={() => moveSubField(index, 'up')}
													disabled={index === 0}
													class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
													title="Move up"
												>
													<Icon icon="material-symbols:keyboard-arrow-up" width="20" height="20" />
												</button>
												<button
													onclick={() => moveSubField(index, 'down')}
													disabled={index === customField.subFields.length - 1}
													class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
													title="Move down"
												>
													<Icon icon="material-symbols:keyboard-arrow-down" width="20" height="20" />
												</button>
												<button
													onclick={() => removeSubField(index)}
													class="p-1 text-red-600 hover:text-red-700"
													title="Remove sub-field"
												>
													<Icon icon="material-symbols:delete" width="20" height="20" />
												</button>
											</div>
										</div>

										<div class="grid grid-cols-2 gap-4 mb-3">
												<!-- Sub-field Name -->
												<div>
													<label for="edit-subfield-name-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
														Name *
													</label>
													<input
														id="edit-subfield-name-{index}"
														bind:value={subField.name}
														type="text"
														placeholder="e.g., Street, Landmark, Zip Code..."
														class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
													/>
												</div>

												<!-- Sub-field Type -->
												<div>
													<label for="edit-subfield-type-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
														Type
													</label>
													<select
														id="edit-subfield-type-{index}"
														bind:value={subField.type}
														class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
													>
														{#each basicFieldTypes as fieldType}
															<option value={fieldType.id}>{fieldType.name}</option>
														{/each}
													</select>
												</div>
										</div>

										<!-- Validation Rules -->
										<div class="border-t border-gray-200 dark:border-gray-600 pt-3">
											<h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Validation Rules</h5>
											<div class="grid grid-cols-2 gap-4">
												<div class="flex items-center">
													<input
														id="required-{index}"
														type="checkbox"
														bind:checked={subField.validationRules.required}
														class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded"
													/>
													<label for="required-{index}" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
														Required
													</label>
												</div>

												{#if subField.type === 'text' || subField.type === 'textarea'}
																	<div>
																		<label for="edit-min-length-{index}" class="block text-xs text-gray-500 dark:text-gray-400">Min Length</label>
																		<input
																			id="edit-min-length-{index}"
																			bind:value={subField.validationRules.minLength}
																			type="number"
																			min="0"
																			class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
																		/>
																	</div>
																	<div>
																		<label for="edit-max-length-{index}" class="block text-xs text-gray-500 dark:text-gray-400">Max Length</label>
																		<input
																			id="edit-max-length-{index}"
																			bind:value={subField.validationRules.maxLength}
																			type="number"
																			min="0"
																			class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
																		/>
																	</div>
												{/if}

												{#if subField.type === 'number'}
																	<div>
																		<label for="edit-min-value-{index}" class="block text-xs text-gray-500 dark:text-gray-400">Min Value</label>
																		<input
																			id="edit-min-value-{index}"
																			bind:value={subField.validationRules.min}
																			type="number"
																			class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
																		/>
																	</div>
																	<div>
																		<label for="edit-max-value-{index}" class="block text-xs text-gray-500 dark:text-gray-400">Max Value</label>
																		<input
																			id="edit-max-value-{index}"
																			bind:value={subField.validationRules.max}
																			type="number"
																			class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
																		/>
																	</div>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Save Button -->
					<div class="flex justify-between">
						<button 
							onclick={deleteCustomField}
							class="inline-flex items-center px-6 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
						>
							<Icon icon="material-symbols:delete" class="mr-2" width="20" height="20" />
							Delete Custom Field
						</button>
						<button 
							onclick={saveCustomField}
							class="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!customField.name.trim() || customField.subFields.length === 0}
						>
							<Icon icon="material-symbols:save" class="mr-2" width="20" height="20" />
							Save Changes
						</button>
					</div>
				</div>
			</div>

			<!-- Preview Panel -->
			{#if showPreview}
				<div class="lg:sticky lg:top-6 lg:h-fit">
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
						
						{#if customField.name}
							<div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
								<!-- Custom Field Header -->
								<div class="flex items-center space-x-3 mb-4">
									<div class="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
										<Icon icon={customField.icon} class="text-orange-600" width="24" height="24" />
									</div>
									<div>
										<h4 class="font-semibold text-gray-900 dark:text-white">{customField.name}</h4>
										{#if customField.description}
											<p class="text-sm text-gray-600 dark:text-gray-400">{customField.description}</p>
										{/if}
									</div>
								</div>

								<!-- Sub-fields Layout -->
								{#if customField.subFields.length > 0}
									<div class="grid gap-4" class:grid-cols-1={customField.columns === 1} class:grid-cols-2={customField.columns === 2} class:grid-cols-3={customField.columns === 3}>
										{#each customField.subFields as subField}
															<div class="space-y-1">
																<label for="edit-preview-{subField.id}" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
																	{subField.name}
																	{#if subField.validationRules.required}
																		<span class="text-red-500">*</span>
																	{/if}
																</label>
								{#if subField.type === 'textarea'}
									<textarea
										id="edit-preview-{subField.id}"
										placeholder="Enter {subField.name.toLowerCase()}..."
										rows="3"
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 text-sm"
										disabled
									></textarea>
								{:else if subField.type === 'select'}
									<select
										id="edit-preview-{subField.id}"
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
										disabled
									>
										<option>Select {subField.name.toLowerCase()}...</option>
									</select>
								{:else if subField.type === 'checkbox'}
									<div class="flex items-center space-x-2">
										<input id="edit-preview-{subField.id}" type="checkbox" class="h-4 w-4 text-orange-600 rounded" disabled />
										<span class="text-sm text-gray-700 dark:text-gray-300">Check this option</span>
									</div>
								{:else}
									<input
										id="edit-preview-{subField.id}"
										type={subField.type}
										placeholder="Enter {subField.name.toLowerCase()}..."
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 text-sm"
										disabled
									/>
								{/if}
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
										Add sub-fields to see the preview
									</p>
								{/if}

								<!-- Tags -->
								{#if customField.tags.length > 0}
									<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
										<div class="flex flex-wrap gap-1">
											{#each customField.tags as tag}
												<span class="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
													#{tag}
												</span>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<p class="text-gray-500 dark:text-gray-400 text-center py-8">
								Enter a custom field name to see the preview
							</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
