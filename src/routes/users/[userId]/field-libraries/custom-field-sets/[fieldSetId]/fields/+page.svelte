<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';

	const userId = page.params.userId;
	const fieldSetId = page.params.fieldSetId;

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

	// Mock data - in real app this would come from the server
	let customFields = $state<CustomField[]>([
		{
			id: 'custom-address',
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
		},
		{
			id: 'custom-patient-info',
			name: 'Patient Information',
			description: 'Comprehensive patient data collection for healthcare forms',
			tags: ['healthcare', 'patient', 'medical'],
			columns: 1,
			icon: 'material-symbols:medical-services',
			subFields: [
				{
					id: 'full-name',
					name: 'Full Name',
					type: 'text',
					sequence: 1,
					validationRules: { required: true, minLength: 2, maxLength: 100 }
				},
				{
					id: 'dob',
					name: 'Date of Birth',
					type: 'date',
					sequence: 2,
					validationRules: { required: true }
				},
				{
					id: 'emergency-contact',
					name: 'Emergency Contact',
					type: 'tel',
					sequence: 3,
					validationRules: { required: true }
				},
				{
					id: 'allergies',
					name: 'Known Allergies',
					type: 'textarea',
					sequence: 4,
					validationRules: { required: false, maxLength: 500 }
				}
			],
			createdAt: '2024-01-18T14:20:00Z',
			updatedAt: '2024-01-22T09:15:00Z'
		},
		{
			id: 'custom-event-registration',
			name: 'Event Registration',
			description: 'Complete event registration with attendee details and preferences',
			tags: ['event', 'registration', 'booking'],
			columns: 3,
			icon: 'material-symbols:event',
			subFields: [
				{
					id: 'event-name',
					name: 'Event Name',
					type: 'text',
					sequence: 1,
					validationRules: { required: true }
				},
				{
					id: 'attendee-count',
					name: 'Number of Attendees',
					type: 'number',
					sequence: 2,
					validationRules: { required: true, min: 1, max: 100 }
				},
				{
					id: 'special-requirements',
					name: 'Special Requirements',
					type: 'textarea',
					sequence: 3,
					validationRules: { required: false, maxLength: 300 }
				}
			],
			createdAt: '2024-01-15T11:45:00Z',
			updatedAt: '2024-01-20T16:20:00Z'
		}
	]);

	let showPreviewModal = $state(false);
	let previewField = $state<CustomField | null>(null);

	// Functions
	function createNewField() {
		window.location.href = `/users/${userId}/field-libraries/custom-field-sets/new`;
	}

	function editField(fieldId: string) {
		window.location.href = `/users/${userId}/field-libraries/custom-field-sets/${fieldSetId}/fields/${fieldId}`;
	}

	function previewField_func(field: CustomField) {
		previewField = field;
		showPreviewModal = true;
	}

	function deleteField(fieldId: string) {
		if (confirm('Are you sure you want to delete this custom field? This action cannot be undone.')) {
			customFields = customFields.filter(f => f.id !== fieldId);
		}
	}

	function goBack() {
		window.location.href = `/users/${userId}/field-libraries/custom-field-sets/${fieldSetId}`;
	}

	function getFieldTypeIcon(type: string) {
		const iconMap: Record<string, string> = {
			'text': 'material-symbols:text-fields',
			'textarea': 'material-symbols:notes',
			'email': 'material-symbols:email',
			'tel': 'material-symbols:phone',
			'number': 'material-symbols:numbers',
			'date': 'material-symbols:calendar-today',
			'select': 'material-symbols:arrow-drop-down',
			'checkbox': 'material-symbols:check-box',
			'radio': 'material-symbols:radio-button-checked'
		};
		return iconMap[type] || 'material-symbols:text-fields';
	}

	function getLayoutInfo(columns: number) {
		const layouts = {
			1: { name: '1-Column', icon: 'material-symbols:view-agenda' },
			2: { name: '2-Column', icon: 'material-symbols:view-column' },
			3: { name: '3-Column', icon: 'material-symbols:view-module' }
		};
		return layouts[columns as keyof typeof layouts] || layouts[1];
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Custom Fields - Field Library</title>
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
							Custom Fields
						</h1>
						<p class="text-gray-600 dark:text-gray-400 mt-1">
							Manage your custom field collection
						</p>
					</div>
				</div>
				<div class="flex items-center space-x-3">
					<button 
						onclick={createNewField}
						class="inline-flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
					>
						<Icon icon="material-symbols:add" class="mr-2" width="20" height="20" />
						Create Custom Field
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if customFields.length === 0}
			<!-- Empty State -->
			<div class="text-center py-12">
				<Icon icon="material-symbols:text-fields" class="mx-auto text-gray-400 mb-4" width="64" height="64" />
				<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Custom Fields Yet</h3>
				<p class="text-gray-500 dark:text-gray-400 mb-6">
					Create your first custom field to start building reusable form components
				</p>
				<button 
					onclick={createNewField}
					class="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
				>
					<Icon icon="material-symbols:add" class="mr-2" width="20" height="20" />
					Create Custom Field
				</button>
			</div>
		{:else}
			<!-- Fields Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				{#each customFields as field}
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
						<!-- Field Header -->
						<div class="flex items-start justify-between mb-4">
							<div class="flex items-center space-x-3">
								<div class="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
									<Icon icon={field.icon} class="text-orange-600" width="24" height="24" />
								</div>
								<div>
									<h3 class="text-lg font-semibold text-gray-900 dark:text-white">{field.name}</h3>
									<div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
										<Icon icon={getLayoutInfo(field.columns).icon} width="14" height="14" />
										<span>{getLayoutInfo(field.columns).name}</span>
										<span>•</span>
										<span>{field.subFields.length} sub-fields</span>
									</div>
								</div>
							</div>
						</div>

						<!-- Field Description -->
						<p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
							{field.description}
						</p>

						<!-- Sub-fields Preview -->
						<div class="mb-4">
							<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sub-fields:</h4>
							<div class="grid grid-cols-2 gap-2">
								{#each field.subFields.slice(0, 4) as subField}
									<div class="flex items-center space-x-2 text-sm">
										<Icon icon={getFieldTypeIcon(subField.type)} width="14" height="14" class="text-gray-400" />
										<span class="text-gray-600 dark:text-gray-400 truncate">{subField.name}</span>
										{#if subField.validationRules.required}
											<span class="text-red-500 text-xs">*</span>
										{/if}
									</div>
								{/each}
								{#if field.subFields.length > 4}
									<div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
										<Icon icon="material-symbols:more-horiz" width="14" height="14" />
										<span>+{field.subFields.length - 4} more</span>
									</div>
								{/if}
							</div>
						</div>

						<!-- Tags -->
						{#if field.tags.length > 0}
							<div class="mb-4">
								<div class="flex flex-wrap gap-1">
									{#each field.tags.slice(0, 3) as tag}
										<span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
											#{tag}
										</span>
									{/each}
									{#if field.tags.length > 3}
										<span class="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded text-xs">
											+{field.tags.length - 3}
										</span>
									{/if}
								</div>
							</div>
						{/if}

						<!-- Timestamps -->
						<div class="text-xs text-gray-500 dark:text-gray-400 mb-4">
							<div>Created: {formatDate(field.createdAt)}</div>
							<div>Updated: {formatDate(field.updatedAt)}</div>
						</div>

						<!-- Actions -->
						<div class="flex space-x-2">
							<button
								onclick={() => previewField_func(field)}
								class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
							>
								<Icon icon="material-symbols:preview" class="mr-2" width="16" height="16" />
								Preview
							</button>
							<button
								onclick={() => editField(field.id)}
								class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
							>
								<Icon icon="material-symbols:edit" class="mr-2" width="16" height="16" />
								Edit
							</button>
							<button
								onclick={() => deleteField(field.id)}
								class="px-3 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
								title="Delete field"
							>
								<Icon icon="material-symbols:delete" width="16" height="16" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Preview Modal -->
{#if showPreviewModal && previewField}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<!-- Modal Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
				<div class="flex items-center space-x-3">
					<div class="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
						<Icon icon={previewField.icon} class="text-orange-600" width="24" height="24" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">{previewField.name}</h3>
						<p class="text-sm text-gray-500 dark:text-gray-400">Custom Field Preview</p>
					</div>
				</div>
				<button
					onclick={() => showPreviewModal = false}
					class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				>
					<Icon icon="material-symbols:close" width="24" height="24" />
				</button>
			</div>

			<!-- Modal Content -->
			<div class="p-6">
				<!-- Field Info -->
				<div class="mb-6">
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span class="text-gray-500 dark:text-gray-400">Layout:</span>
							<span class="ml-2 text-gray-900 dark:text-white">{getLayoutInfo(previewField.columns).name}</span>
						</div>
						<div>
							<span class="text-gray-500 dark:text-gray-400">Sub-fields:</span>
							<span class="ml-2 text-gray-900 dark:text-white">{previewField.subFields.length}</span>
						</div>
					</div>
					{#if previewField.description}
						<p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{previewField.description}</p>
					{/if}
				</div>

				<!-- Form Preview -->
				<div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
					<h4 class="font-medium text-gray-900 dark:text-white mb-4">Form Preview</h4>
					<div class="grid gap-4" class:grid-cols-1={previewField.columns === 1} class:grid-cols-2={previewField.columns === 2} class:grid-cols-3={previewField.columns === 3}>
						{#each previewField.subFields as subField}
													<div class="space-y-1">
														<label for="modal-preview-{subField.id}" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
															{subField.name}
															{#if subField.validationRules.required}
																<span class="text-red-500">*</span>
															{/if}
														</label>
								{#if subField.type === 'textarea'}
									<textarea
										id="modal-preview-{subField.id}"
										placeholder="Enter {subField.name.toLowerCase()}..."
										rows="3"
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 text-sm"
										disabled
									></textarea>
								{:else if subField.type === 'select'}
									<select
										id="modal-preview-{subField.id}"
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
										disabled
									>
										<option>Select {subField.name.toLowerCase()}...</option>
									</select>
								{:else if subField.type === 'checkbox'}
									<div class="flex items-center space-x-2">
										<input id="modal-preview-{subField.id}" type="checkbox" class="h-4 w-4 text-orange-600 rounded" disabled />
										<span class="text-sm text-gray-700 dark:text-gray-300">Check this option</span>
									</div>
								{:else if subField.type === 'radio'}
									<div class="space-y-2">
										<div class="flex items-center space-x-2">
											<input id="modal-preview-{subField.id}-1" type="radio" name="radio-{subField.id}" class="h-4 w-4 text-orange-600" disabled />
											<span class="text-sm text-gray-700 dark:text-gray-300">Option 1</span>
										</div>
										<div class="flex items-center space-x-2">
											<input id="modal-preview-{subField.id}-2" type="radio" name="radio-{subField.id}" class="h-4 w-4 text-orange-600" disabled />
											<span class="text-sm text-gray-700 dark:text-gray-300">Option 2</span>
										</div>
									</div>
								{:else}
									<input
										id="modal-preview-{subField.id}"
										type={subField.type}
										placeholder="Enter {subField.name.toLowerCase()}..."
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 text-sm"
										disabled
									/>
								{/if}
								{#if subField.validationRules.minLength || subField.validationRules.maxLength || subField.validationRules.min || subField.validationRules.max}
									<div class="text-xs text-gray-500 dark:text-gray-400">
										{#if subField.validationRules.minLength}Min length: {subField.validationRules.minLength}{/if}
										{#if subField.validationRules.maxLength}{subField.validationRules.minLength ? ', ' : ''}Max length: {subField.validationRules.maxLength}{/if}
										{#if subField.validationRules.min}Min value: {subField.validationRules.min}{/if}
										{#if subField.validationRules.max}{subField.validationRules.min ? ', ' : ''}Max value: {subField.validationRules.max}{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<!-- Tags and Metadata -->
				{#if previewField.tags.length > 0}
					<div class="mt-6">
						<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h4>
						<div class="flex flex-wrap gap-2">
							{#each previewField.tags as tag}
								<span class="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm">
									#{tag}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
				<button
					onclick={() => showPreviewModal = false}
					class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
				>
					Close
				</button>
				<button
					onclick={() => editField(previewField.id)}
					class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
				>
					Edit Field
				</button>
			</div>
		</div>
	</div>
{/if}
