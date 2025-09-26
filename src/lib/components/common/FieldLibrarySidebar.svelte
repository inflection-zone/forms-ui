<script lang="ts">
	import { onMount } from 'svelte';
	import { draggable } from './dnd';
	import { Button } from '$lib/components/ui/button/index.js';
	import Icon from '@iconify/svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { basicCards, healthCarePlugins } from '$lib/components/common/questionTypes';
	import { addToast } from '$lib/components/toast/toast.store';
	import { fieldLibraryService, type FieldLibraryCategory, type FieldLibraryItem } from '$lib/services/field-library.service';

	interface Props {
		typeOfQuestion: 'Basic' | 'HealthCare' | 'FieldLibrary';
		changeTypes: (event: Event) => void;
		isOpen: boolean;
	}

	let { typeOfQuestion, changeTypes, isOpen }: Props = $props();

	// Field library state
	let fieldLibraryCategories: any[] = $state([]);
	let selectedCategory: string = $state('');
	let searchQuery: string = $state('');
	let searchResults: any[] = $state([]);
	let isLoading: boolean = $state(false);
	let showImportDialog: boolean = $state(false);
	let showExportDialog: boolean = $state(false);
	let selectedTemplate: string = $state('');

	// Section templates
	let SectionTemplate = {
		id: Math.random(),
		localId: Math.random(),
		name: '',
		type: 'Section',
		cards: [],
		subsections: [],
		subsectionCount: 0
	};

	let selectedTab = $state('Basic');
	
	// Expandable sections state
	let basicExpanded = $state(false);
	let healthCareExpanded = $state(false);
	
	// Individual Field Library category states
	let fieldLibraryCategoryExpanded: Record<string, boolean> = $state({});

	// Function to get category icons
	function getCategoryIcon(categoryName: string): string {
		const iconMap: Record<string, string> = {
			'business-professional': 'material-symbols:business-center',
			'date-time': 'material-symbols:schedule',
			'e-commerce': 'material-symbols:shopping-cart',
			'educational': 'material-symbols:school',
			'financial': 'material-symbols:account-balance',
			'geographic': 'material-symbols:place',
			'healthcare': 'healthicons:medical-kit',
			'legal': 'material-symbols:gavel',
			'measurement': 'material-symbols:straighten',
			'personal': 'material-symbols:person',
			'research': 'material-symbols:science',
			'survey-research': 'material-symbols:poll',
			'text-based': 'material-symbols:text-fields',
			'validation': 'material-symbols:verified'
		};
		return iconMap[categoryName] || 'material-symbols:category-outline';
	}

	// Function to get field type icons
	function getFieldIcon(fieldType: string, responseType: string): string {
		const iconMap: Record<string, string> = {
			'text': 'material-symbols:text-fields',
			'email': 'material-symbols:email',
			'phone': 'material-symbols:phone',
			'url': 'material-symbols:link',
			'textarea': 'material-symbols:notes',
			'number': 'material-symbols:numbers',
			'integer': 'material-symbols:123',
			'float': 'material-symbols:decimal',
			'currency': 'material-symbols:attach-money',
			'percentage': 'material-symbols:percent',
			'date': 'material-symbols:calendar-today',
			'time': 'material-symbols:schedule',
			'datetime': 'material-symbols:event',
			'boolean': 'material-symbols:toggle-on',
			'checkbox': 'material-symbols:check-box',
			'radio': 'material-symbols:radio-button-checked',
			'select': 'material-symbols:arrow-drop-down',
			'multiselect': 'material-symbols:checklist',
			'rating': 'material-symbols:star',
			'range': 'material-symbols:tune',
			'file': 'material-symbols:attach-file',
			'image': 'material-symbols:image',
			'address': 'material-symbols:location-on',
			'name': 'material-symbols:person',
			'age': 'material-symbols:elderly',
			'gender': 'material-symbols:transgender',
			'height': 'material-symbols:height',
			'weight': 'material-symbols:monitor-weight',
			'temperature': 'material-symbols:thermostat',
			'pulse': 'material-symbols:favorite',
			'blood-pressure': 'material-symbols:monitor-heart',
			'country': 'material-symbols:public',
			'state': 'material-symbols:location-city',
			'city': 'material-symbols:location-city',
			'zipcode': 'material-symbols:markunread-mailbox',
			'credit-card': 'material-symbols:credit-card',
			'bank-account': 'material-symbols:account-balance',
			'price': 'material-symbols:attach-money',
			'quantity': 'material-symbols:inventory',
			'product': 'material-symbols:inventory-2',
			'category': 'material-symbols:category',
			'tag': 'material-symbols:tag',
			'color': 'material-symbols:palette',
			'size': 'material-symbols:straighten',
			'weight': 'material-symbols:monitor-weight',
			'dimension': 'material-symbols:straighten',
			'volume': 'material-symbols:invert-colors',
			'area': 'material-symbols:square-foot',
			'speed': 'material-symbols:speed',
			'temperature': 'material-symbols:thermostat',
			'pressure': 'material-symbols:compress',
			'energy': 'material-symbols:bolt',
			'power': 'material-symbols:power',
			'frequency': 'material-symbols:graphic-eq',
			'angle': 'material-symbols:rotate-right',
			'length': 'material-symbols:straighten',
			'distance': 'material-symbols:straighten',
			'time': 'material-symbols:schedule',
			'duration': 'material-symbols:timer',
			'interval': 'material-symbols:schedule',
			'frequency': 'material-symbols:graphic-eq',
			'rate': 'material-symbols:trending-up',
			'ratio': 'material-symbols:aspect-ratio',
			'proportion': 'material-symbols:aspect-ratio',
			'concentration': 'material-symbols:science',
			'density': 'material-symbols:science',
			'viscosity': 'material-symbols:water-drop',
			'conductivity': 'material-symbols:bolt',
			'resistance': 'material-symbols:electrical-services',
			'capacitance': 'material-symbols:electrical-services',
			'inductance': 'material-symbols:electrical-services',
			'voltage': 'material-symbols:electrical-services',
			'current': 'material-symbols:electrical-services',
			'power': 'material-symbols:power',
			'energy': 'material-symbols:bolt',
			'frequency': 'material-symbols:graphic-eq',
			'wavelength': 'material-symbols:waves',
			'amplitude': 'material-symbols:graphic-eq',
			'phase': 'material-symbols:rotate-right',
			'period': 'material-symbols:schedule',
			'wavelength': 'material-symbols:waves',
			'frequency': 'material-symbols:graphic-eq',
			'amplitude': 'material-symbols:graphic-eq',
			'phase': 'material-symbols:rotate-right',
			'period': 'material-symbols:schedule'
		};
		
		// Try to match by fieldType first, then responseType
		return iconMap[fieldType] || iconMap[responseType] || 'material-symbols:category-outline';
	}

	onMount(async () => {
		await loadFieldLibraryCategories();
	});

	// Watch for selectedCategory changes and load fields
	$effect(() => {
		if (selectedCategory && fieldLibraryCategories.length > 0) {
			onCategoryChange(selectedCategory);
		}
	});

	// Sync expandable state with typeOfQuestion prop
	$effect(() => {
		basicExpanded = typeOfQuestion === 'Basic';
		healthCareExpanded = typeOfQuestion === 'HealthCare';
		// Field Library categories are handled individually
	});

	async function loadFieldLibraryCategories() {
		try {
			isLoading = true;
			const categories = await fieldLibraryService.getCategories();
			fieldLibraryCategories = categories;
			if (categories.length > 0 && !selectedCategory) {
				selectedCategory = categories[0].name;
				// Fields are now pre-loaded with categories, no need to load them separately
			}
		} catch (error) {
			console.error('Failed to load field library categories:', error);
			addToast({
				message: 'Failed to load field library categories',
				type: 'error',
				timeout: 3000
			});
		} finally {
			isLoading = false;
		}
	}

	async function onCategoryChange(categoryName: string) {
		console.log('Category change triggered with:', categoryName);
		
		if (!categoryName) return;
		
		selectedCategory = categoryName;
		try {
			isLoading = true;
			// Fields are now pre-loaded with categories, no need for separate API call
			const category = fieldLibraryCategories.find(cat => cat.name === categoryName);
			console.log('Selected category:', categoryName, category);
			
			if (!category || !category.fields) {
				console.warn('Category not found or has no fields:', categoryName);
				return;
			}
		} catch (error) {
			console.error('Failed to load fields for category:', categoryName, error);
			addToast({
				message: `Failed to load fields for ${categoryName}`,
				type: 'error',
				timeout: 3000
			});
		} finally {
			isLoading = false;
		}
	}

	async function onSearch() {
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}

		try {
			isLoading = true;
			console.log('Searching for:', searchQuery);
			const results = await fieldLibraryService.searchFields(searchQuery);
			console.log('Search results:', results);
			searchResults = results;
		} catch (error) {
			console.error('Search failed:', error);
			addToast({
				message: 'Search failed',
				type: 'error',
				timeout: 3000
			});
		} finally {
			isLoading = false;
		}
	}

	function handleImportTemplate() {
		console.log('Import template clicked');
	}

	async function handleExportTemplate() {
		console.log('Export template clicked');
	}

	// Expandable section handlers
	function toggleBasic() {
		basicExpanded = !basicExpanded;
		if (basicExpanded) {
			healthCareExpanded = false;
			fieldLibraryExpanded = false;
			changeTypes('Basic');
		}
	}

	function toggleHealthCare() {
		healthCareExpanded = !healthCareExpanded;
		if (healthCareExpanded) {
			basicExpanded = false;
			fieldLibraryExpanded = false;
			changeTypes('HealthCare');
		}
	}

	function toggleFieldLibraryCategory(categoryName: string) {
		fieldLibraryCategoryExpanded[categoryName] = !fieldLibraryCategoryExpanded[categoryName];
		// Close other categories when opening one
		if (fieldLibraryCategoryExpanded[categoryName]) {
			basicExpanded = false;
			healthCareExpanded = false;
			// Close other field library categories
			Object.keys(fieldLibraryCategoryExpanded).forEach(key => {
				if (key !== categoryName) {
					fieldLibraryCategoryExpanded[key] = false;
				}
			});
			changeTypes('FieldLibrary');
		}
	}

	const currentFields = $derived(() => {
		if (typeOfQuestion === 'Basic') {
			return basicCards;
		} else if (typeOfQuestion === 'HealthCare') {
			return healthCarePlugins;
		} else if (typeOfQuestion === 'FieldLibrary') {
			if (searchQuery.trim() && searchResults.length > 0) {
				console.log('Using search results:', searchResults);
				return searchResults.map((field: any) => ({
					id: field.id,
					name: field.name,
					value: field.responseType,
					icon: field.icon || 'material-symbols:category-outline',
					category: field.category,
					description: field.description,
					type: 'card',
					// Include all Field Library configuration data
					fieldId: field.fieldId,
					fieldType: field.type,
					validationOptions: field.validationOptions,
					configurationOptions: field.configurationOptions,
					defaultValue: field.defaultValue,
					isRequired: field.isRequired,
					dependencies: field.dependencies,
					useCases: field.useCases,
					accessibility: field.accessibility,
					htmlType: field.htmlType,
					component: field.component,
					schema: field.schema,
					logic: field.logic,
					sequence: field.sequence,
					isActive: field.isActive,
					tags: field.tags,
					version: field.version
				}));
			}
			const category = fieldLibraryCategories.find(c => c.name === selectedCategory);
			console.log('Selected category:', selectedCategory);
			console.log('Found category:', category);
			console.log('Category fields:', category?.fields);
			return category ? category.fields.map((field: any) => ({
				id: field.id,
				name: field.name,
				value: field.responseType,
				icon: field.icon || 'material-symbols:category-outline',
				category: field.category,
				description: field.description,
				type: 'card',
				// Include all Field Library configuration data
				fieldId: field.fieldId,
				fieldType: field.type,
				validationOptions: field.validationOptions,
				configurationOptions: field.configurationOptions,
				defaultValue: field.defaultValue,
				isRequired: field.isRequired,
				dependencies: field.dependencies,
				useCases: field.useCases,
				accessibility: field.accessibility,
				htmlType: field.htmlType,
				component: field.component,
				schema: field.schema,
				logic: field.logic,
				sequence: field.sequence,
				isActive: field.isActive,
				tags: field.tags,
				version: field.version
			})) : [];
		}
		return [];
	});
</script>

	<!-- Enhanced Sidebar with Field Library Integration -->
<div class="relative h-[calc(screen-2rem)] min-h-screen w-full overflow-y-hidden {isOpen ? 'block' : 'hidden'} md:block">
	<Card.Root class="!rounded-none !border-none px-4 py-5 !shadow-none md:w-full bg-gray-50 dark:bg-gray-800">
		<Card.Title class="text-md mb-3 text-gray-700 dark:text-gray-200">Drag Section From Here</Card.Title>
		<div
			class="flex cursor-grab items-center justify-center"
			use:draggable={{ ...SectionTemplate, type: 'section' }}
			role="button"
			aria-label="Draggable new section template"
		>
			<Button
				class="space-x-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 md:w-full"
				variant="outline"
			>
				<Icon
					icon="teenyicons:section-add-outline"
					width="16"
					height="16"
					class="mr-2 text-primary"
				/>
				Add Section
			</Button>
		</div>
	</Card.Root>


	<!-- Question Types -->
	<Card.Root class="!rounded-none !border-none !shadow-none md:w-full md:px-2 2xl:w-full bg-white dark:bg-gray-900">
		<Card.Title class="text-md px-3 py-3 flex items-center justify-between text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
			<span class="font-semibold">Field Library</span>
			<div class="flex gap-1">
				<Button
					variant="ghost"
					size="sm"
					onclick={() => handleImportTemplate()}
					class="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
				>
					<Icon icon="material-symbols:upload" class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onclick={() => showExportDialog = true}
					class="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
				>
					<Icon icon="material-symbols:download" class="h-4 w-4" />
				</Button>
			</div>
		</Card.Title>
		
		<!-- Search Bar -->
		<div class="px-3 py-3 bg-gray-50 dark:bg-gray-800">
			<div class="relative">
				<input
					type="text"
					placeholder="Search fields..."
					bind:value={searchQuery}
					oninput={onSearch}
					class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 pr-10 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
				/>
				<Icon
					icon="material-symbols:search"
					class="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500"
				/>
			</div>
		</div>


		<div class="space-y-1 px-3 pb-3">
			<!-- Search Results Section -->
			{#if searchQuery.trim()}
				<div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
					<div class="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
						<div class="flex items-center gap-2">
							<Icon icon="material-symbols:search" class="h-4 w-4 text-blue-600 dark:text-blue-400" />
							<span class="text-sm font-medium text-blue-700 dark:text-blue-300">
								{#if searchResults.length > 0}
									Search Results ({searchResults.length})
								{:else}
									Search Results
								{/if}
							</span>
						</div>
					</div>
					<div class="p-3 bg-gray-50 dark:bg-gray-800">
						{#if searchResults.length > 0}
							<div class="space-y-1">
								{#each searchResults as field}
									<div
										class="w-full cursor-grab rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
										use:draggable={{ 
											id: field.id,
											name: field.name,
											value: field.responseType,
											icon: field.icon || 'material-symbols:category-outline',
											category: field.category,
											description: field.description,
											type: 'card',
											fieldId: field.fieldId,
											fieldType: field.type,
											validationOptions: field.validationOptions,
											configurationOptions: field.configurationOptions,
											defaultValue: field.defaultValue,
											isRequired: field.isRequired,
											dependencies: field.dependencies,
											useCases: field.useCases,
											accessibility: field.accessibility,
											htmlType: field.htmlType,
											component: field.component,
											schema: field.schema,
											logic: field.logic,
											sequence: field.sequence,
											isActive: field.isActive,
											tags: field.tags,
											version: field.version
										}}
										role="button"
										aria-label={`Draggable card: ${field.name}`}
									>
										<Button class="w-full justify-start space-x-2 text-left" variant="ghost">
											<Icon icon={field.icon || getFieldIcon(field.type, field.responseType)} width="20" height="20" class="text-primary" />
											<div class="flex flex-col items-start">
												<span class="text-sm text-gray-700 dark:text-gray-200">{field.name}</span>
												<span class="text-xs text-gray-500 dark:text-gray-400">{field.category}</span>
											</div>
										</Button>
									</div>
								{/each}
							</div>
						{:else}
							<div class="flex flex-col items-center justify-center py-8 text-center">
								<Icon icon="material-symbols:search-off" class="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
								<p class="text-sm text-gray-500 dark:text-gray-400">No fields found for "{searchQuery}"</p>
								<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Basic Fields Section -->
			<div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
				<button
					class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
					onclick={toggleBasic}
				>
					<div class="flex items-center gap-3">
						<Icon icon="material-symbols:edit-outline" class="h-5 w-5 text-primary" />
						<span class="font-medium text-gray-700 dark:text-gray-200">Basic Fields</span>
						<span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">5 types</span>
					</div>
					<Icon 
						icon="material-symbols:keyboard-arrow-down" 
						class="h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform {basicExpanded ? 'rotate-180' : ''}"
					/>
				</button>
				{#if basicExpanded}
					<div class="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
						<div class="space-y-1">
							{#each basicCards as card}
								<div
									class="w-full cursor-grab rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
									use:draggable={{ ...card, type: 'card' }}
									role="button"
									aria-label={`Draggable card: ${card.name}`}
								>
									<Button class="w-full justify-start space-x-2 text-left" variant="ghost">
										<Icon icon={card.icon} width="20" height="20" class="text-primary" />
										<span class="text-sm text-gray-700 dark:text-gray-200">{card.name}</span>
									</Button>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Health Care Fields Section -->
			<div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
				<button
					class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
					onclick={toggleHealthCare}
				>
					<div class="flex items-center gap-3">
						<Icon icon="healthicons:medical-kit" class="h-5 w-5 text-primary" />
						<span class="font-medium text-gray-700 dark:text-gray-200">Health Care Fields</span>
						<span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">4 types</span>
					</div>
					<Icon 
						icon="material-symbols:keyboard-arrow-down" 
						class="h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform {healthCareExpanded ? 'rotate-180' : ''}"
					/>
				</button>
				{#if healthCareExpanded}
					<div class="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
						<div class="space-y-1">
							{#each healthCarePlugins as card}
								<div
									class="w-full cursor-grab rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
									use:draggable={{ ...card, type: 'card' }}
									role="button"
									aria-label={`Draggable card: ${card.name}`}
								>
									<Button class="w-full justify-start space-x-2 text-left" variant="ghost">
										<Icon icon={card.icon} width="20" height="20" class="text-primary" />
										<span class="text-sm text-gray-700 dark:text-gray-200">{card.name}</span>
									</Button>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Individual Field Library Categories -->
			{#each fieldLibraryCategories as category}
				<div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
					<button
						class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
						onclick={() => toggleFieldLibraryCategory(category.name)}
					>
					<div class="flex items-center gap-3">
						<Icon icon={category.icon || getCategoryIcon(category.name)} class="h-5 w-5 text-primary" />
						<span class="font-medium text-gray-700 dark:text-gray-200">{category.displayName}</span>
						<span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{category.fieldCount} types</span>
					</div>
						<Icon 
							icon="material-symbols:keyboard-arrow-down" 
							class="h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform {fieldLibraryCategoryExpanded[category.name] ? 'rotate-180' : ''}"
						/>
					</button>
					{#if fieldLibraryCategoryExpanded[category.name]}
						<div class="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
							<div class="space-y-1">
								{#if isLoading}
									<div class="flex items-center justify-center py-8">
										<Icon icon="svg-spinners:ring-resize" class="h-6 w-6 text-primary" />
										<span class="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading...</span>
									</div>
								{:else if category.fields && category.fields.length === 0}
									<div class="flex flex-col items-center justify-center py-8 text-center">
										<Icon icon="material-symbols:search-off" class="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
										<p class="text-sm text-gray-500 dark:text-gray-400">No fields available</p>
									</div>
								{:else}
									{#each category.fields || [] as field}
										<div
											class="w-full cursor-grab rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
											use:draggable={{ 
												id: field.id,
												name: field.name,
												value: field.responseType,
												icon: field.icon || 'material-symbols:category-outline',
												category: field.category,
												description: field.description,
												type: 'card',
												fieldId: field.fieldId,
												fieldType: field.type,
												validationOptions: field.validationOptions,
												configurationOptions: field.configurationOptions,
												defaultValue: field.defaultValue,
												isRequired: field.isRequired,
												dependencies: field.dependencies,
												useCases: field.useCases,
												accessibility: field.accessibility,
												htmlType: field.htmlType,
												component: field.component,
												schema: field.schema,
												logic: field.logic,
												sequence: field.sequence,
												isActive: field.isActive,
												tags: field.tags,
												version: field.version
											}}
											role="button"
											aria-label={`Draggable card: ${field.name}`}
											onclick={() => {
												console.log('Field library card clicked:', field);
											}}
											onmousedown={() => console.log('Mouse down on field library card:', field.name)}
											ondragstart={() => console.log('Drag start on field library card:', field.name)}
										>
											<Button class="w-full justify-start space-x-2 text-left" variant="ghost">
												<Icon icon={field.icon || getFieldIcon(field.type, field.responseType)} width="20" height="20" class="text-primary" />
												<div class="flex flex-col items-start">
													<span class="text-sm text-gray-700 dark:text-gray-200">{field.name}</span>
													{#if field.description}
														<span class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
															{field.description}
														</span>
													{/if}
												</div>
											</Button>
										</div>
									{/each}
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</Card.Root>
</div>

<!-- Export Dialog -->
<Dialog.Root bind:open={showExportDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Export Field Template</Dialog.Title>
			<Dialog.Description>
				Select a template to export as a JSON file.
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4">
			<Select.Root type="single" bind:value={selectedTemplate}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select template to export" />
				</Select.Trigger>
				<Select.Content>
					<!-- Template options would be populated from API -->
					<Select.Item value="template1">Basic Form Template</Select.Item>
					<Select.Item value="template2">Healthcare Template</Select.Item>
					<Select.Item value="template3">Survey Template</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => showExportDialog = false}>
				Cancel
			</Button>
			<Button onclick={handleExportTemplate} disabled={!selectedTemplate}>
				Export Template
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	label:hover .relative {
		transform: scale(1.1);
		transition: transform 0.2s ease-in-out;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 2px;
		height: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 1px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>