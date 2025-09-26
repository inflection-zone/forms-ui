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

	onMount(async () => {
		await loadFieldLibraryCategories();
	});

	// Watch for selectedCategory changes and load fields
	$effect(() => {
		if (selectedCategory && fieldLibraryCategories.length > 0) {
			onCategoryChange(selectedCategory);
		}
	});

	async function loadFieldLibraryCategories() {
		try {
			isLoading = true;
			const categories = await fieldLibraryService.getCategories();
			fieldLibraryCategories = categories;
			if (categories.length > 0 && !selectedCategory) {
				selectedCategory = categories[0].name;
				// Load fields for the first category
				await onCategoryChange(selectedCategory);
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
			const fields = await fieldLibraryService.getFieldsByCategory(categoryName);
			console.log('Loaded fields for category:', categoryName, fields);
			
			// Update the category with loaded fields
			const categoryIndex = fieldLibraryCategories.findIndex(cat => cat.name === categoryName);
			if (categoryIndex !== -1) {
				fieldLibraryCategories[categoryIndex].fields = fields;
				console.log('Updated category fields:', fieldLibraryCategories[categoryIndex]);
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
			const results = await fieldLibraryService.searchFields(searchQuery);
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
	<Card.Root class="!rounded-none !border-none px-4 py-5 !shadow-none md:w-full">
		<Card.Title class="text-md mb-3">Drag Section From Here</Card.Title>
		<div
			class="flex cursor-grab items-center justify-center"
			use:draggable={{ ...SectionTemplate, type: 'section' }}
			role="button"
			aria-label="Draggable new section template"
		>
			<Button
				class="space-x-2 rounded-md border dark:border-gray-400 md:w-full"
				variant="secondary"
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
	<Card.Root class="!rounded-none !border-none !shadow-none md:w-full md:px-2 2xl:w-full">
		<Card.Title class="text-md px-3 flex items-center justify-between">
			{typeOfQuestion === 'FieldLibrary' ? 'Field Library' : 'Question'}
			{#if typeOfQuestion === 'FieldLibrary'}
				<div class="flex gap-1">
					<Button
						variant="ghost"
						size="sm"
						onclick={() => handleImportTemplate()}
						class="h-6 w-6 p-0"
					>
						<Icon icon="material-symbols:upload" class="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onclick={() => showExportDialog = true}
						class="h-6 w-6 p-0"
					>
						<Icon icon="material-symbols:download" class="h-4 w-4" />
					</Button>
				</div>
			{/if}
		</Card.Title>
		<div class="rounded-md px-3 dark:border-gray-400">
				<div class="flex flex-wrap justify-around py-2 px-4 rounded-tl-md rounded-tr-md border border-b-0">
					<label class="flex cursor-pointer items-center">
						<input
							type="radio"
							name="layoutType"
							value="Basic"
							bind:group={selectedTab}
							checked={typeOfQuestion === 'Basic'}
							onchange={changeTypes}
							class="sr-only"
						/>
						<span class="relative mr-3 flex h-4 w-4 items-center justify-center rounded-full border border-primary">
							<span
								class="absolute h-2 w-2 rounded-full bg-primary {typeOfQuestion === 'Basic'
									? 'opacity-100'
									: 'opacity-0'} transition-opacity duration-200 ease-in-out"
							></span>
						</span>
						Basic
					</label>
					<label class="mx-2 flex cursor-pointer items-center">
						<input
							type="radio"
							name="layoutType"
							value="HealthCare"
							bind:group={selectedTab}
							checked={typeOfQuestion === 'HealthCare'}
							onchange={changeTypes}
							class="sr-only"
						/>
						<span class="relative mr-3 flex h-4 w-4 items-center justify-center rounded-full border border-primary">
							<span
								class="absolute h-2 w-2 rounded-full bg-primary {typeOfQuestion === 'HealthCare'
									? 'opacity-100'
									: 'opacity-0'} transition-opacity duration-200 ease-in-out"
							></span>
						</span>
						Health Care
					</label>
					<label class="mx-2 flex cursor-pointer items-center">
						<input
							type="radio"
							name="layoutType"
							value="FieldLibrary"
							bind:group={selectedTab}
							checked={typeOfQuestion === 'FieldLibrary'}
							onchange={changeTypes}
							class="sr-only"
						/>
						<span class="relative mr-3 flex h-4 w-4 items-center justify-center rounded-full border border-primary">
							<span
								class="absolute h-2 w-2 rounded-full bg-primary {typeOfQuestion === 'FieldLibrary'
									? 'opacity-100'
									: 'opacity-0'} transition-opacity duration-200 ease-in-out"
							></span>
						</span>
						Field Library
					</label>
				</div>
				{#if typeOfQuestion === 'FieldLibrary'}
					<!-- Search Bar -->
					<div class="mb-3">
						<div class="relative">
							<input
								type="text"
								placeholder="Search fields..."
								bind:value={searchQuery}
								oninput={onSearch}
								class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
							/>
							<Icon
								icon="material-symbols:search"
								class="absolute right-3 top-2.5 h-4 w-4 text-gray-400"
							/>
						</div>
					</div>

					<!-- Category Selection -->
					{#if !searchQuery.trim()}
						<div class="mb-3">
							<Select.Root type="single" bind:value={selectedCategory} onValueChange={onCategoryChange}>
								<Select.Trigger class="w-full">
									<Select.Value placeholder="Select category" />
								</Select.Trigger>
								<Select.Content>
									{#each fieldLibraryCategories as category}
										<Select.Item value={category.name}>
											<div class="flex items-center gap-2">
												<Icon icon={category.icon} class="h-4 w-4" />
												{category.displayName} ({category.fieldCount})
											</div>
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					{/if}
				{/if}

				<div class="custom-scrollbar overflow-y-auto rounded-bl-md rounded-br-md border py-4">
					{#if typeOfQuestion === 'FieldLibrary' && selectedTab === 'FieldLibrary'}
						{#if isLoading}
							<div class="flex items-center justify-center py-8">
								<Icon icon="svg-spinners:ring-resize" class="h-6 w-6 text-primary" />
								<span class="ml-2 text-sm text-gray-500">Loading...</span>
							</div>
						{:else if currentFields().length === 0}
							<div class="flex flex-col items-center justify-center py-8 text-center">
								<Icon icon="material-symbols:search-off" class="h-8 w-8 text-gray-400 mb-2" />
								<p class="text-sm text-gray-500">
									{searchQuery.trim() ? 'No fields found' : 'No fields available'}
								</p>
							</div>
						{:else}
							<ul class="space-y-2 px-2">
								{#each currentFields() as card}
									<li>
										<div
											class="w-full cursor-grab"
											use:draggable={{ ...card, type: 'card' }}
											role="button"
											aria-label={`Draggable card: ${card.name}`}
											onclick={() => {
												console.log('Field library card clicked:', { ...card, type: 'card' });
												console.log('Card data for drag:', card);
											}}
											onmousedown={() => console.log('Mouse down on field library card:', card.name)}
											ondragstart={() => console.log('Drag start on field library card:', card.name)}
										>
											<Button class="w-full justify-start space-x-2" variant="ghost">
												<Icon icon={card.icon} width="20" height="20" class="text-primary" />
												<div class="flex flex-col items-start">
													<span class="text-sm">{card.name}</span>
													{#if card.description}
														<span class="text-xs text-gray-500 truncate max-w-32">
															{card.description}
														</span>
													{/if}
												</div>
											</Button>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					{:else}
						<ul class="space-y-2 px-2">
							{#if typeOfQuestion === 'HealthCare' && selectedTab === 'HealthCare'}
								{#each healthCarePlugins as card}
									<li>
										<div
											class="w-full cursor-grab"
											use:draggable={{ ...card, type: 'card' }}
											role="button"
											aria-label={`Draggable card: ${card.name}`}
										>
											<Button class="w-full justify-start space-x-2" variant="ghost">
												<Icon icon={card.icon} width="20" height="20" class="text-primary" />
												<span>{card.name}</span>
											</Button>
										</div>
									</li>
								{/each}
							{:else if typeOfQuestion === 'Basic' && selectedTab === 'Basic'}
								{#each basicCards as card}
									<li>
										<div
											class="w-full cursor-grab"
											use:draggable={{ ...card, type: 'card' }}
											role="button"
											aria-label={`Draggable card: ${card.name}`}
										>
											<Button class="w-full justify-start space-x-2" variant="ghost">
												<Icon icon={card.icon} width="20" height="20" class="text-primary" />
												<span>{card.name}</span>
											</Button>
										</div>
									</li>
								{/each}
							{/if}
						</ul>
					{/if}
				</div>
			</div>
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