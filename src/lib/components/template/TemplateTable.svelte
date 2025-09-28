<script lang="ts">
	import Icon from '@iconify/svelte';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { errorMessage, successMessage } from '../toast/message.utils';
	import { toastMessage } from '../toast/toast.store';
	import { enhance } from '$app/forms';
	import TemplateForm from './TemplateForm.svelte';
	import EmbedModal from './EmbedModal.svelte';
	import { assessmentSchema } from './assessment-schema';
	import { IndexedDbStorageManager } from '$lib/utils/indexdb.store.manager';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data, errors = $bindable(), handleTemplateUpdate } = $props();

	let isLoading = $state(false);
	let assessmentTemplates = $state(data.assessmentTemplate.Items);

	$effect(() => {
		assessmentTemplates = data.assessmentTemplate.Items;
	});
	const userId = page.params.userId;

	let sortOrder = $state('ascending');

	let isSortingTitle = $state(false);
	let isSortingType = $state(false);

	let link: string = $state();
	let open = $state(false);

	let copied = $state(false);
	
	// Modal states for native implementations
	let showEditModal = $state(false);
	let showLinkModal = $state(false);
	let showDeleteModal = $state(false);
	let showEmbedModal = $state(false);
	let currentTemplateId = $state('');
	let currentTemplateData = $state(null);
	
	// Tooltip state
	let hoveredButton = $state(null);

	// Format date to readable format
	function formatDate(dateString: string): string {
		if (!dateString) return 'Invalid Date';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return 'Invalid Date';
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: '2-digit'
		}).format(date);
	}

	let searchQuery = $state('');
	let currentPage = $state(1);
	let itemsPerPage: number = $state(5);

	// Derived list based on search, sort and pagination
	$effect(() => {
		let filtered = assessmentTemplates;

		// Search filter
		if (searchQuery) {
			const lowerQuery = searchQuery.toLowerCase();
			filtered = assessmentTemplates.filter(
				(row) =>
					row.Title?.toLowerCase().includes(lowerQuery) ||
					row.Type?.toLowerCase().includes(lowerQuery)
			);
		}

		// Sort
		filtered.sort((a, b) => {
			const field = isSortingTitle ? 'Title' : isSortingType ? 'Type' : null;
			if (!field) return 0;

			const valueA = a[field]?.toLowerCase() || '';
			const valueB = b[field]?.toLowerCase() || '';
			return sortOrder === 'ascending'
				? valueA.localeCompare(valueB)
				: valueB.localeCompare(valueA);
		});

		filteredTemplates = filtered;
		currentPage = 1; // reset to first page when filters change
	});

	let filteredTemplates = $state([]);
	$effect(() => {
		const start = (currentPage - 1) * itemsPerPage;
		paginatedTemplates = filteredTemplates.slice(start, start + itemsPerPage);
		filteredTemplates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	});

	let paginatedTemplates = $state([]);
	// $inspect('these are paginated templates', paginatedTemplates);
	// $inspect('these are filterd templates', filteredTemplates);

	// let itemsPerPage = 5;
	// let currentPage = 1;
	// let filteredTemplates = new Array(23); // just an example
	function updatePageSize(event) {
		itemsPerPage = parseInt(event.target.value);
		currentPage = 1;
	}
	// function changePage(offset) {
	// 	const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
	// 	currentPage = Math.max(1, Math.min(currentPage + offset, totalPages));
	// }

	// let itemsPerPageValue = $state(5);
	const itemsPerPageOptions = [
		{ value: 5, label: '5 records per page' },
		{ value: 10, label: '10 records per page' },
		{ value: 15, label: '15 records per page' },
		{ value: 20, label: '20 records per page' }
	];

	const selectedLabel = $derived(
		itemsPerPageOptions.find((f) => f.value === itemsPerPage)?.label ?? 'Select per page'
	);

	function changePage(offset) {
		const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
		currentPage = Math.max(1, Math.min(currentPage + offset, totalPages));
	}

	// Sorting function
	function sortTable(field: 'Title' | 'Type') {
		const isTitleSort = field === 'Title';
		isSortingTitle = isTitleSort;
		isSortingType = !isTitleSort;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';

		assessmentTemplates.sort((a, b) => {
			const valueA = a[field]?.toLowerCase() || '';
			const valueB = b[field]?.toLowerCase() || '';

			if (sortOrder === 'ascending') return valueA.localeCompare(valueB);
			return valueB.localeCompare(valueA);
		});
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(link);
			copied = true;
			setTimeout(() => (copied = false), 2000);
			successMessage('Link Copied');
		} catch (error) {
			errorMessage('Failed to copy link');
		}
	}

	function openLink() {
		window.open(link, '_blank');
	}
	$inspect(link, 'LINK');

	async function handleDeleteAssessment(id: string) {
		try {
			const response = await fetch(`/api/server/template/${id}`, {
				method: 'DELETE'
			});
			const res = await response.json();
			console.log('response', res);
			// toastMessage(res);
			toastMessage(res);
			invalidate('app:template');
			open = false;
			// return response;
		} catch (error) {
			console.error('Delete Error:', error);
			// toastMessage();
			return null;
		}
	}

	const createLink = async (templateId: string) => {
		try {
			if (!navigator.onLine) {
				console.warn('You are offline. Generating offline link...');
				const generalStorage = new IndexedDbStorageManager('general', 'environment_variables');
				const code = Math.random().toString(36).substring(2, 8);
				const encryptedId = btoa(templateId);
				const offlineLink = `offline-${code}-${encryptedId}`;
				const baseUrlObj = await generalStorage.get('this_base_url');
				if (baseUrlObj === null) {
					console.error('Base URL not found in IndexedDB');
					return null;
				}
				const baseUrl = baseUrlObj['this_base_url'] || 'http://localhost:5173';
				console.log(JSON.stringify(baseUrlObj));
				link = `${baseUrl}/offline-form/submissions/${offlineLink}`;
				toastMessage({
					Message: 'You are offline. A temporary link has been generated.',
					Data: { Link: link }
				});
				return link;
			}

			const response = await fetch(`/api/server/submission`, {
				method: 'POST',
				body: JSON.stringify({ FormTemplateId: templateId }),
				headers: { 'Content-Type': 'application/json' }
			});
			const result = await response.json();
			if (result.HttpCode === 201 || result.State === 'success') {
				link = result?.Data?.Link;
				toastMessage(result);
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error('Submission Error:', error);
			toastMessage();
			return null;
		}
	};

	async function handleSubmit(event: Event) {
		event.preventDefault();

		const form = (event.currentTarget as HTMLElement).closest('form');
		if (!form) {
			console.error('Form not found!');
			return;
		}

		const formData = new FormData(form);
		const model = {
			id: formData.get('id'),
			Title: formData.get('Title'),
			Description: formData.get('Description'),
			TenantCode: formData.get('TenantCode'),
			CurrentVersion: formData.get('CurrentVersion'),
			Type: formData.get('Type'),
			ItemsPerPage: formData.get('ItemsPerPage')
		};

		console.log('Form Model:', model);

		const result = await assessmentSchema.safeParseAsync(model);
		if (!result.success) {
			console.log('Client side validation error', result.error.flatten().fieldErrors);
			errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
		}

		if (Object.keys(errors).length === 0 || result?.success) {
			handleTemplateUpdate(model);
			closeAllModals();
		}
	}

	// Helper functions for modal operations
	function openEditModal(templateData) {
		currentTemplateData = templateData;
		showEditModal = true;
	}

	function openLinkModal(templateId: string) {
		currentTemplateId = templateId;
		showLinkModal = true;
	}

	function openEmbedModal(templateId: string) {
		currentTemplateId = templateId;
		showEmbedModal = true;
	}

	function openDeleteModal(templateId: string) {
		currentTemplateId = templateId;
		showDeleteModal = true;
	}

	function closeAllModals() {
		showEditModal = false;
		showLinkModal = false;
		showDeleteModal = false;
		showEmbedModal = false;
		currentTemplateId = '';
		currentTemplateData = null;
	}


	// Button variant classes
	function getButtonClasses(variant: 'default' | 'ghost' | 'outline' | 'destructive' = 'default', size: 'sm' | 'md' | 'lg' = 'md') {
		const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
		
		const variants = {
			default: 'bg-primary text-primary-foreground hover:bg-primary/90',
			ghost: 'hover:bg-accent hover:text-accent-foreground',
			outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
			destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
		};

		const sizes = {
			sm: 'h-9 px-3 text-sm',
			md: 'h-10 py-2 px-4',
			lg: 'h-11 px-8'
		};

		return `${baseClasses} ${variants[variant]} ${sizes[size]}`;
	}

	async function exportFormTemplate(templateId: string, templateTitle: string) {
		const response = await fetch(`/api/server/template/export`, {
			method: 'POST',
			body: JSON.stringify({
				// sessionId,
				templateId: templateId,
			}),
			headers: { 'content-type': 'application/json' }
		});
		if (!response.ok) {
			throw new Error(`Failed to export care plan: ${response.statusText}`);
		}

		const filename = `${templateTitle}.json`;
		const blob = await response.blob();
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<div class="my-4 flex items-center justify-between">
	<input
		type="text"
		placeholder="Search by title or type"
		class="w-full max-w-sm flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
		bind:value={searchQuery}
	/>
</div>
<div class="my-4 w-full overflow-x-auto rounded-md border">
	<table class="w-full table-auto border-collapse border border-slate-200">
		<thead class="border">
			<tr class="bg-secondary">
				<th class="w-12 p-3">Sr No</th>
				<th class="w-44 py-3 text-start">
					<button 
						class="{getButtonClasses('ghost')} text-md font-bold" 
						onclick={() => sortTable('Title')}
					>
						Title {isSortingTitle ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
					</button>
				</th>
				<th class=" w-32 py-3 text-start">
					<button 
						class="{getButtonClasses('ghost')} text-md font-bold" 
						onclick={() => sortTable('Type')}
					>
						Type {isSortingType ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
					</button>
				</th>
				<!-- <th class="p-4 text-center">Description</th>
				<th class="p-4 text-center">Tenant Code</th> -->
				<th class=" w-32 p-3 text-start">Created At</th>
				<th class=" w-20 p-3 text-center">Version</th>
				<th class=" w-48 p-3 text-center">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if isLoading}
				<tr><td colspan="8" class="p-4 text-center">Loading...</td></tr>
			{:else if assessmentTemplates.length === 0}
				<tr><td colspan="8" class="p-4 text-center">No records found</td></tr>
			{:else}
				{#each paginatedTemplates as row, index}
					<tr class="border-b border-l border-r p-4 hover:bg-tertiary">
						<td class="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
						<td class="px-3 py-1 text-sm capitalize">
							<a
								href={`/users/${userId}/form-templates/${row.id}/dashboard`}
								class="hover:text-blue-500 hover:underline"
							>
								{row.Title || 'Not specified'}
							</a>
						</td>
						<td class="mx-10 px-3 py-1 text-sm">{row.Type || 'N/A'}</td>
						<td class="px-3 py-1 text-start text-sm">{formatDate(row.CreatedAt)}</td>
						<td class="text-center text-sm">{row.CurrentVersion || '-'}</td>
						<td class="text-center text-sm">
							<div class="flex items-center justify-center gap-1">
								<!-- Edit Button -->
								<div class="relative">
									<button
										class="{getButtonClasses('ghost', 'sm')} p-2 h-10 w-10"
										onclick={() => openEditModal(row)}
										onmouseenter={() => hoveredButton = `edit-${row.id}`}
										onmouseleave={() => hoveredButton = null}
									>
										<Icon icon="material-symbols:edit-outline" width="20" height="20" />
									</button>
									{#if hoveredButton === `edit-${row.id}`}
										<div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
											Edit
										</div>
									{/if}
								</div>

								<!-- Preview Button -->
								<div class="relative">
									<a
										href="/users/{userId}/form-templates/{row.id}/preview"
										class="{getButtonClasses('ghost', 'sm')} p-2 h-10 w-10"
										onmouseenter={() => hoveredButton = `preview-${row.id}`}
										onmouseleave={() => hoveredButton = null}
									>
										<Icon icon="icon-park-outline:preview-open" width="20" height="20" />
									</a>
									{#if hoveredButton === `preview-${row.id}`}
										<div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
											Preview
										</div>
									{/if}
								</div>

								<!-- Generate Link Button -->
								<div class="relative">
									<button
										class="{getButtonClasses('ghost', 'sm')} p-2 h-10 w-10"
										onclick={() => openLinkModal(row.id)}
										onmouseenter={() => hoveredButton = `link-${row.id}`}
										onmouseleave={() => hoveredButton = null}
									>
										<Icon icon="material-symbols:link" width="20" height="20" />
									</button>
									{#if hoveredButton === `link-${row.id}`}
										<div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
											Generate Link
										</div>
									{/if}
								</div>

								<!-- Embed Button -->
								<div class="relative">
									<button
										class="{getButtonClasses('ghost', 'sm')} p-2 h-10 w-10"
										onclick={() => openEmbedModal(row.id)}
										onmouseenter={() => hoveredButton = `embed-${row.id}`}
										onmouseleave={() => hoveredButton = null}
									>
										<Icon icon="material-symbols:code" width="20" height="20" />
									</button>
									{#if hoveredButton === `embed-${row.id}`}
										<div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
											Embed Form
										</div>
									{/if}
								</div>

								<!-- Export Button -->
								<div class="relative">
									<button
										class="{getButtonClasses('ghost', 'sm')} p-2 h-10 w-10"
										onclick={() => exportFormTemplate(row.id, row.Title)}
										onmouseenter={() => hoveredButton = `export-${row.id}`}
										onmouseleave={() => hoveredButton = null}
									>
										<Icon icon="lucide:download" width="20" height="20" />
									</button>
									{#if hoveredButton === `export-${row.id}`}
										<div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
											Export
										</div>
									{/if}
								</div>

								<!-- Delete Button -->
								<div class="relative">
									<button
										class="{getButtonClasses('ghost', 'sm')} p-2 h-10 w-10 text-red-500 hover:text-red-600"
										onclick={() => openDeleteModal(row.id)}
										onmouseenter={() => hoveredButton = `delete-${row.id}`}
										onmouseleave={() => hoveredButton = null}
									>
										<Icon icon="material-symbols:delete-outline" width="20" height="20" />
									</button>
									{#if hoveredButton === `delete-${row.id}`}
										<div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
											Delete
										</div>
									{/if}
								</div>
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
<div class="my-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
	<!-- Items Per Page Dropdown -->
	<div class="flex flex-col items-start text-sm text-gray-500 dark:text-gray-400">
		<label for="itemsPerPage" class="mb-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Items per page</label>
		<div class="relative">
			<select
				id="itemsPerPage"
				class="appearance-none rounded-md border border-gray-300 px-4 py-2 pr-10 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:text-white bg-secondary"
				onchange={updatePageSize}
				bind:value={itemsPerPage}
			>
				<option value={5}>5 records per page</option>
				<option value={10}>10 records per page</option>
				<option value={15}>15 records per page</option>
				<option value={20}>20 records per page</option>
			</select>
			<!-- Chevron Icon -->
			<div
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
			>
				<Icon icon="mdi:chevron-down" class="h-4 w-4" />
			</div>
		</div>
		<!-- Page Info -->
		<span class="mt-1 text-xs text-gray-500 dark:text-gray-400">
			Page {currentPage} of {Math.ceil(filteredTemplates.length / itemsPerPage)}
		</span>
	</div>

	<!-- Pagination Buttons -->
	<div class="flex items-center space-x-2">
		<button 
			class={getButtonClasses('default', 'sm')} 
			onclick={() => changePage(-1)} 
			disabled={currentPage === 1}
		>
			<Icon icon="material-symbols:chevron-left-rounded" width="20" height="20" />
		</button>
		<button
			class={getButtonClasses('default', 'sm')}
			onclick={() => changePage(1)}
			disabled={currentPage === Math.ceil(filteredTemplates.length / itemsPerPage)}
		>
			<Icon icon="material-symbols:chevron-right-rounded" width="20" height="20" />
		</button>
	</div>
</div>

<!-- Edit Modal -->
{#if showEditModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.target === e.currentTarget && closeAllModals()} onkeydown={(e) => e.key === 'Escape' && closeAllModals()}>
		<div class="scrollbar-hide max-h-[90%] max-w-[95%] overflow-y-auto rounded-md bg-background p-6 shadow-lg md:max-w-[85%] lg:max-w-[45%]" role="document">
			<div class="mb-4">
				<h2 class="text-lg font-semibold">Edit Template</h2>
				<p class="text-sm text-muted-foreground">Make changes to your form template here. Click save when you're done.</p>
			</div>
			<form method="post" use:enhance>
				<TemplateForm templateData={currentTemplateData} bind:errors />
				<div class="mt-4 flex justify-end gap-2">
					<button 
						type="button"
						class="{getButtonClasses('outline')}"
						onclick={closeAllModals}
					>
						Cancel
					</button>
					<button 
						class="{getButtonClasses('default')}" 
						onclick={handleSubmit} 
						type="submit"
					>
						Save changes
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Link Generation Modal -->
{#if showLinkModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.target === e.currentTarget && closeAllModals()} onkeydown={(e) => e.key === 'Escape' && closeAllModals()}>
		<div class="max-w-md rounded-md bg-background p-6 shadow-lg" role="document">
			<div class="mb-4">
				<h2 class="text-lg font-semibold">Template Link</h2>
				<p class="text-sm text-muted-foreground">Generate link to copy and share form template for data collection.</p>
			</div>
			<div class="mb-4 flex w-full items-center gap-2">
				<div class="relative flex-1">
					<input
						bind:value={link}
						type="text"
						class="w-full overflow-x-auto whitespace-nowrap rounded-lg border border-input bg-background px-4 py-2 pr-10 text-sm"
						readonly
					/>
					<Icon
						icon={copied ? 'material-symbols:check-circle-rounded' : 'ion:copy-outline'}
						width="24"
						height="24"
						class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1"
						onclick={copyToClipboard}
					/>
				</div>
				<button 
					class={getButtonClasses('default')} 
					onclick={() => createLink(currentTemplateId)}
				>
					Generate
				</button>
			</div>
			<div class="flex justify-end gap-2">
				<button 
					class="{getButtonClasses('outline')}"
					onclick={closeAllModals}
				>
					Cancel
				</button>
				<button 
					class="{getButtonClasses('default')}"
					onclick={openLink}
				>
					Open
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Embed Modal Component -->
<EmbedModal 
	bind:showModal={showEmbedModal} 
	templateId={currentTemplateId}
	onClose={closeAllModals}
/>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.target === e.currentTarget && closeAllModals()} onkeydown={(e) => e.key === 'Escape' && closeAllModals()}>
		<div class="max-w-md rounded-md bg-background p-6 shadow-lg" role="document">
			<div class="mb-4">
				<h2 class="text-lg font-semibold">Are you absolutely sure?</h2>
				<p class="text-sm text-muted-foreground">This action cannot be undone. Deleting will remove the template and all associated data.</p>
			</div>
			<div class="flex justify-end gap-2">
				<button 
					class="{getButtonClasses('outline')}"
					onclick={closeAllModals}
				>
					Cancel
				</button>
				<button 
					class="{getButtonClasses('destructive')}"
					onclick={() => {
						handleDeleteAssessment(currentTemplateId);
						closeAllModals();
					}}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}
