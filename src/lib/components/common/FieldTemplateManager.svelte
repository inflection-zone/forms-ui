<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Icon from '@iconify/svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Label from '$lib/components/ui/label/index.js';
	import * as Textarea from '$lib/components/ui/textarea/index.js';
	import { fieldLibraryService, type FieldLibraryTemplate, type FieldLibraryItem } from '$lib/services/field-library.service';
	import { addToast } from '$lib/components/toast/toast.store';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	// State
	let templates: FieldLibraryTemplate[] = $state([]);
	let selectedTemplate: string = $state('');
	let newTemplate: Partial<FieldLibraryTemplate> = $state({
		name: '',
		description: '',
		category: '',
		fields: [],
		tags: [],
		isPublic: false
	});
	let showCreateDialog: boolean = $state(false);
	let showImportDialog: boolean = $state(false);
	let showExportDialog: boolean = $state(false);
	let isLoading: boolean = $state(false);
	let selectedFields: FieldLibraryItem[] = $state([]);

	onMount(async () => {
		if (isOpen) {
			await loadTemplates();
		}
	});

	$effect(() => {
		if (isOpen) {
			loadTemplates();
		}
	});

	async function loadTemplates() {
		try {
			isLoading = true;
			const loadedTemplates = await fieldLibraryService.getTemplates();
			templates = loadedTemplates;
		} catch (error) {
			console.error('Failed to load templates:', error);
			addToast({
				message: 'Failed to load templates',
				type: 'error',
				timeout: 3000
			});
		} finally {
			isLoading = false;
		}
	}

	async function createTemplate() {
		if (!newTemplate.name || !newTemplate.description) {
			addToast({
				message: 'Please fill in all required fields',
				type: 'error',
				timeout: 3000
			});
			return;
		}

		try {
			const template = await fieldLibraryService.createTemplate({
				...newTemplate,
				fields: selectedFields,
				version: '1.0.0',
				createdBy: 'current-user', // This would come from auth context
			} as Omit<FieldLibraryTemplate, 'id' | 'createdAt' | 'updatedAt'>);

			addToast({
				message: `Template "${template.name}" created successfully`,
				type: 'success',
				timeout: 3000
			});

			showCreateDialog = false;
			resetNewTemplate();
			await loadTemplates();
		} catch (error) {
			console.error('Failed to create template:', error);
			addToast({
				message: 'Failed to create template',
				type: 'error',
				timeout: 3000
			});
		}
	}

	async function exportTemplate() {
		if (!selectedTemplate) return;

		try {
			const blob = await fieldLibraryService.exportTemplate(selectedTemplate);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `field-template-${selectedTemplate}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			addToast({
				message: 'Template exported successfully',
				type: 'success',
				timeout: 3000
			});

			showExportDialog = false;
		} catch (error) {
			console.error('Failed to export template:', error);
			addToast({
				message: 'Failed to export template',
				type: 'error',
				timeout: 3000
			});
		}
	}

	function handleImportTemplate() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				try {
					const template = await fieldLibraryService.importTemplate(file);
					addToast({
						message: `Template "${template.name}" imported successfully`,
						type: 'success',
						timeout: 3000
					});
					await loadTemplates();
				} catch (error) {
					addToast({
						message: 'Failed to import template',
						type: 'error',
						timeout: 3000
					});
				}
			}
		};
		input.click();
	}

	function resetNewTemplate() {
		newTemplate = {
			name: '',
			description: '',
			category: '',
			fields: [],
			tags: [],
			isPublic: false
		};
		selectedFields = [];
	}

	function addTag(tag: string) {
		if (tag && !newTemplate.tags?.includes(tag)) {
			newTemplate.tags = [...(newTemplate.tags || []), tag];
		}
	}

	function removeTag(tag: string) {
		newTemplate.tags = newTemplate.tags?.filter(t => t !== tag) || [];
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(e) => !e && onClose()}>
	<Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Field Template Manager</Dialog.Title>
			<Dialog.Description>
				Manage industry-specific field template sets. Create, import, and export field collections.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6">
			<!-- Action Buttons -->
			<div class="flex gap-2">
				<Button onclick={() => showCreateDialog = true} class="flex items-center gap-2">
					<Icon icon="material-symbols:add" class="h-4 w-4" />
					Create Template
				</Button>
				<Button variant="outline" onclick={handleImportTemplate} class="flex items-center gap-2">
					<Icon icon="material-symbols:upload" class="h-4 w-4" />
					Import Template
				</Button>
				<Button variant="outline" onclick={() => showExportDialog = true} class="flex items-center gap-2">
					<Icon icon="material-symbols:download" class="h-4 w-4" />
					Export Template
				</Button>
			</div>

			<!-- Templates List -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Available Templates</h3>
				{#if isLoading}
					<div class="flex items-center justify-center py-8">
						<Icon icon="svg-spinners:ring-resize" class="h-6 w-6 text-primary" />
						<span class="ml-2 text-sm text-gray-500">Loading templates...</span>
					</div>
				{:else if templates.length === 0}
					<div class="flex flex-col items-center justify-center py-8 text-center">
						<Icon icon="material-symbols:template-outline" class="h-12 w-12 text-gray-400 mb-4" />
						<p class="text-gray-500 mb-4">No templates available</p>
						<Button onclick={() => showCreateDialog = true}>Create Your First Template</Button>
					</div>
				{:else}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each templates as template}
							<Card.Root class="cursor-pointer hover:shadow-md transition-shadow">
								<Card.Header>
									<Card.Title class="flex items-center justify-between">
										{template.name}
										<span class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
											v{template.version}
										</span>
									</Card.Title>
									<Card.Description>{template.description}</Card.Description>
								</Card.Header>
								<Card.Content>
									<div class="space-y-2">
										<div class="flex items-center gap-2 text-sm text-gray-600">
											<Icon icon="material-symbols:category" class="h-4 w-4" />
											{template.category}
										</div>
										<div class="flex items-center gap-2 text-sm text-gray-600">
											<Icon icon="material-symbols:widgets" class="h-4 w-4" />
											{template.fields.length} fields
										</div>
										{#if template.tags && template.tags.length > 0}
											<div class="flex flex-wrap gap-1">
												{#each template.tags as tag}
													<span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
														{tag}
													</span>
												{/each}
											</div>
										{/if}
									</div>
								</Card.Content>
								<Card.Footer class="flex gap-2">
									<Button size="sm" variant="outline" class="flex-1">
										<Icon icon="material-symbols:visibility" class="h-4 w-4 mr-1" />
										View
									</Button>
									<Button size="sm" variant="outline" class="flex-1">
										<Icon icon="material-symbols:edit" class="h-4 w-4 mr-1" />
										Edit
									</Button>
								</Card.Footer>
							</Card.Root>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={onClose}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Create Template Dialog -->
<Dialog.Root bind:open={showCreateDialog}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Create New Field Template</Dialog.Title>
			<Dialog.Description>
				Create a new industry-specific field template set.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label.Root for="template-name">Template Name</Label.Root>
				<Input.Root>
					<Input.Input
						id="template-name"
						bind:value={newTemplate.name}
						placeholder="Enter template name"
					/>
				</Input.Root>
			</div>

			<div class="space-y-2">
				<Label.Root for="template-description">Description</Label.Root>
				<Textarea.Root>
					<Textarea.Input
						id="template-description"
						bind:value={newTemplate.description}
						placeholder="Describe the purpose of this template"
						rows={3}
					/>
				</Textarea.Root>
			</div>

			<div class="space-y-2">
				<Label.Root for="template-category">Category</Label.Root>
				<Select.Root type="single" bind:value={newTemplate.category}>
					<Select.Trigger>
						<Select.Value placeholder="Select category" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="general">General</Select.Item>
						<Select.Item value="healthcare">Healthcare</Select.Item>
						<Select.Item value="business">Business</Select.Item>
						<Select.Item value="education">Education</Select.Item>
						<Select.Item value="ecommerce">E-commerce</Select.Item>
						<Select.Item value="survey">Survey</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<Label.Root>Tags</Label.Root>
				<div class="flex flex-wrap gap-2 mb-2">
					{#each newTemplate.tags || [] as tag}
						<span class="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm">
							{tag}
							<button onclick={() => removeTag(tag)} class="hover:text-primary/70">
								<Icon icon="material-symbols:close" class="h-3 w-3" />
							</button>
						</span>
					{/each}
				</div>
				<Input.Root>
					<Input.Input
						placeholder="Add tags (press Enter to add)"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addTag(e.target.value);
								e.target.value = '';
							}
						}}
					/>
				</Input.Root>
			</div>

			<div class="flex items-center space-x-2">
				<input
					type="checkbox"
					id="is-public"
					bind:checked={newTemplate.isPublic}
					class="rounded border-gray-300"
				/>
				<Label.Root for="is-public">Make this template public</Label.Root>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => showCreateDialog = false}>
				Cancel
			</Button>
			<Button onclick={createTemplate}>Create Template</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Export Template Dialog -->
<Dialog.Root bind:open={showExportDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Export Field Template</Dialog.Title>
			<Dialog.Description>
				Select a template to export as a JSON file.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label.Root>Select Template</Label.Root>
				<Select.Root type="single" bind:value={selectedTemplate}>
					<Select.Trigger>
						<Select.Value placeholder="Choose a template to export" />
					</Select.Trigger>
					<Select.Content>
						{#each templates as template}
							<Select.Item value={template.id}>
								{template.name}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => showExportDialog = false}>
				Cancel
			</Button>
			<Button onclick={exportTemplate} disabled={!selectedTemplate}>
				Export Template
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
