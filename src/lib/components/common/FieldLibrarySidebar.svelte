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

	async function loadFieldLibraryCategories() {
		try {
			isLoading = true;
			// Mock data for now to avoid API issues
			fieldLibraryCategories = [
				{
					name: 'text-based',
					displayName: 'Text Based',
					description: 'Text input fields for various text-based data collection',
					icon: 'fluent:text-12-regular',
					fieldCount: 7,
					fields: []
				},
				{
					name: 'healthcare',
					displayName: 'Health Care',
					description: 'Specialized healthcare and medical fields',
					icon: 'healthicons:medical-kit',
					fieldCount: 8,
					fields: []
				}
			];
			if (fieldLibraryCategories.length > 0 && !selectedCategory) {
				selectedCategory = fieldLibraryCategories[0].name;
			}
		} catch (error) {
			console.error('Failed to load field library categories:', error);
		} finally {
			isLoading = false;
		}
	}

	async function onCategoryChange(categoryName: string) {
		selectedCategory = categoryName;
		// Mock implementation
		console.log('Category changed to:', categoryName);
	}

	async function onSearch() {
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}

		try {
			isLoading = true;
			// Mock search results
			searchResults = [];
			console.log('Searching for:', searchQuery);
		} catch (error) {
			console.error('Failed to search fields:', error);
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
				return searchResults.map((field: any) => ({
					id: field.id,
					name: field.name,
					value: field.responseType,
					icon: field.icon || 'material-symbols:category-outline',
					category: field.category,
					description: field.description
				}));
			}
			const category = fieldLibraryCategories.find(c => c.name === selectedCategory);
			return category ? category.fields.map((field: any) => ({
				id: field.id,
				name: field.name,
				value: field.responseType,
				icon: field.icon || 'material-symbols:category-outline',
				category: field.category,
				description: field.description
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

	<!-- Field Library Management -->
	{#if typeOfQuestion === 'FieldLibrary'}
		<Card.Root class="!rounded-none !border-none !shadow-none md:w-full md:px-2 2xl:w-full">
			<Card.Title class="text-md px-3 flex items-center justify-between">
				Field Library
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
			</Card.Title>
			
			<div class="rounded-md px-3 dark:border-gray-400">
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
						<Select.Root type="single" bind:value={selectedCategory} onSelectedChange={(e) => onCategoryChange(e.detail)}>
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

				<!-- Fields List -->
				<div class="custom-scrollbar max-h-96 overflow-y-auto rounded-bl-md rounded-br-md border py-4">
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
				</div>
			</div>
		</Card.Root>
	{/if}

	<!-- Original Question Types -->
	{#if typeOfQuestion !== 'FieldLibrary'}
		<Card.Root class="!rounded-none !border-none !shadow-none md:w-full md:px-2 2xl:w-full">
			<Card.Title class="text-md px-3">Question</Card.Title>
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
				<div class="custom-scrollbar overflow-y-auto rounded-bl-md rounded-br-md border py-4">
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
				</div>
			</div>
		</Card.Root>
	{/if}
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