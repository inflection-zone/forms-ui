<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { successMessage, errorMessage } from '$lib/components/toast/message.utils';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data, userId }: { data: any; userId: string } = $props();

	let selectedTemplates = $state<string[]>([]);
	let exportFormat = $state('json');
	let includeResponses = $state(false);
	let includeMetadata = $state(true);
	let customFileName = $state('');
	let isExporting = $state(false);
	let showExportDialog = $state(false);

	const exportFormats = [
		{ value: 'json', label: 'JSON', description: 'Complete template data with structure' },
		{ value: 'pdf', label: 'PDF', description: 'Human-readable document format' },
		{ value: 'csv', label: 'CSV', description: 'Spreadsheet format for data analysis' },
		{ value: 'zip', label: 'ZIP', description: 'Compressed archive with all files' }
	];

	const templates = data?.assessmentTemplate?.Items || [];

	function toggleTemplateSelection(templateId: string) {
		if (selectedTemplates.includes(templateId)) {
			selectedTemplates = selectedTemplates.filter(id => id !== templateId);
		} else {
			selectedTemplates = [...selectedTemplates, templateId];
		}
	}

	function selectAllTemplates() {
		selectedTemplates = templates.map(t => t.id);
	}

	function clearSelection() {
		selectedTemplates = [];
	}

	async function handleExport() {
		if (selectedTemplates.length === 0) {
			errorMessage('Please select at least one template to export');
			return;
		}

		isExporting = true;
		showExportDialog = false;

		try {
			const response = await fetch('/api/server/export/templates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					templateIds: selectedTemplates,
					format: exportFormat,
					includeResponses,
					includeMetadata,
					fileName: customFileName || undefined
				})
			});

			if (!response.ok) {
				throw new Error('Export failed');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = customFileName || `form-templates-export-${new Date().toISOString().split('T')[0]}.${exportFormat === 'zip' ? 'zip' : exportFormat}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			successMessage(`Successfully exported ${selectedTemplates.length} template(s) as ${exportFormat.toUpperCase()}`);
			selectedTemplates = [];
		} catch (error) {
			console.error('Export error:', error);
			errorMessage('Failed to export templates. Please try again.');
		} finally {
			isExporting = false;
		}
	}

	function formatDate(dateString: string): string {
		if (!dateString) return 'Invalid Date';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return 'Invalid Date';
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: '2-digit'
		}).format(date);
	}
</script>

<div class="space-y-6">
	<!-- Export Controls -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div class="flex flex-col gap-2">
			<h3 class="text-lg font-semibold">Select Templates to Export</h3>
			<p class="text-sm text-muted-foreground">
				Choose which form templates you want to export. You can select multiple templates.
			</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={selectAllTemplates} disabled={templates.length === 0}>
				<Icon icon="material-symbols:select-all" width="16" height="16" class="mr-2" />
				Select All
			</Button>
			<Button variant="outline" onclick={clearSelection} disabled={selectedTemplates.length === 0}>
				<Icon icon="material-symbols:clear" width="16" height="16" class="mr-2" />
				Clear Selection
			</Button>
		</div>
	</div>

	<!-- Template Selection -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each templates as template}
			<Card class="cursor-pointer transition-all hover:shadow-md {selectedTemplates.includes(template.id) ? 'ring-2 ring-primary' : ''}">
				<CardContent class="p-4">
					<div class="flex items-start gap-3">
						<Checkbox
							checked={selectedTemplates.includes(template.id)}
							onCheckedChange={() => toggleTemplateSelection(template.id)}
							class="mt-1"
						/>
						<div class="flex-1 min-w-0">
							<h4 class="font-medium text-sm truncate">{template.Title || 'Untitled Template'}</h4>
							<p class="text-xs text-muted-foreground mt-1">
								Type: {template.Type || 'N/A'} • Version: {template.CurrentVersion || '1'}
							</p>
							<p class="text-xs text-muted-foreground">
								Created: {formatDate(template.CreatedAt)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	{#if templates.length === 0}
		<div class="text-center py-8">
			<Icon icon="material-symbols:inbox" width="48" height="48" class="mx-auto text-muted-foreground mb-4" />
			<p class="text-muted-foreground">No form templates available for export.</p>
		</div>
	{/if}

	<!-- Export Options -->
	{#if selectedTemplates.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>Export Options</CardTitle>
				<CardDescription>
					Configure your export settings and format preferences.
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
					<!-- Export Format -->
					<div class="space-y-2">
						<Label for="export-format">Export Format</Label>
						<Select.Root bind:selected={exportFormat}>
							<Select.Trigger>
								<Select.Value placeholder="Select format" />
							</Select.Trigger>
							<Select.Content>
								{#each exportFormats as format}
									<Select.Item value={format.value}>
										<div class="flex flex-col">
											<span class="font-medium">{format.label}</span>
											<span class="text-xs text-muted-foreground">{format.description}</span>
										</div>
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Custom File Name -->
					<div class="space-y-2">
						<Label for="file-name">Custom File Name (Optional)</Label>
						<Input
							id="file-name"
							bind:value={customFileName}
							placeholder="Leave empty for auto-generated name"
						/>
					</div>
				</div>

				<!-- Additional Options -->
				<div class="space-y-3">
					<div class="flex items-center space-x-2">
						<Checkbox
							id="include-metadata"
							bind:checked={includeMetadata}
						/>
						<Label for="include-metadata" class="text-sm">
							Include metadata (creation date, version, etc.)
						</Label>
					</div>
					<div class="flex items-center space-x-2">
						<Checkbox
							id="include-responses"
							bind:checked={includeResponses}
						/>
						<Label for="include-responses" class="text-sm">
							Include response data (if available)
						</Label>
					</div>
				</div>

				<!-- Export Button -->
				<div class="flex justify-end pt-4">
					<Button
						onclick={handleExport}
						disabled={isExporting}
						class="min-w-32"
					>
						{#if isExporting}
							<Icon icon="material-symbols:loading" width="16" height="16" class="mr-2 animate-spin" />
							Exporting...
						{:else}
							<Icon icon="material-symbols:download" width="16" height="16" class="mr-2" />
							Export {selectedTemplates.length} Template{selectedTemplates.length > 1 ? 's' : ''}
						{/if}
					</Button>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Export History (Placeholder) -->
	<Card>
		<CardHeader>
			<CardTitle>Recent Exports</CardTitle>
			<CardDescription>
				View your recent export history and download previous exports.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="text-center py-8">
				<Icon icon="material-symbols:history" width="48" height="48" class="mx-auto text-muted-foreground mb-4" />
				<p class="text-muted-foreground">No export history available yet.</p>
			</div>
		</CardContent>
	</Card>
</div>
