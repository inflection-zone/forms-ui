<script lang="ts">
	import Icon from '@iconify/svelte';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, buttonVariants } from '../ui/button';
	import { errorMessage, successMessage } from '../toast/message.utils';
	import { toastMessage } from '../toast/toast.store';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { enhance } from '$app/forms';
	import TemplateForm from './TemplateForm.svelte';
	import { assessmentSchema } from './assessment-schema';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Label from '../ui/label/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
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

	let isOpen = $state(false);
	let copied = $state(false);
	let activeMenu = $state(null);

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
			isOpen = false;
		}
	}

	function toggleMenu(id) {
		activeMenu = activeMenu === id ? null : id;
	}

	async function handleExportTemplate(templateId: string, templateTitle: string) {
		try {
			const response = await fetch('/api/server/export', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					templateIds: [templateId],
					format: 'json',
					includeResponses: false,
					includeMetadata: true,
					fileName: `${templateTitle.replace(/[^a-zA-Z0-9]/g, '_')}_export`
				})
			});

			if (!response.ok) {
				throw new Error('Export failed');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${templateTitle.replace(/[^a-zA-Z0-9]/g, '_')}_export.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			successMessage(`Successfully exported "${templateTitle}" as JSON`);
		} catch (error) {
			console.error('Export error:', error);
			errorMessage('Failed to export template. Please try again.');
		}
	}
</script>

<div class="my-4 flex items-center justify-between">
	<Input
		type="text"
		placeholder="Search by title or type"
		class="w-full max-w-sm"
		bind:value={searchQuery}
	/>
</div>
<div class="my-4 w-full overflow-x-auto rounded-md border">
	<table class="w-full table-auto border-collapse border border-slate-200">
		<thead class="border">
			<tr class="bg-secondary">
				<th class="w-12 p-3">Sr No</th>
				<th class="w-44 py-3 text-start">
					<Button variant="ghost" class=" text-md font-bold" onclick={() => sortTable('Title')}>
						Title {isSortingTitle ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
					</Button>
				</th>
				<th class=" w-32 py-3 text-start">
					<Button variant="ghost" class="text-md font-bold" onclick={() => sortTable('Type')}>
						Type {isSortingType ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
					</Button>
				</th>
				<!-- <th class="p-4 text-center">Description</th>
				<th class="p-4 text-center">Tenant Code</th> -->
				<th class=" w-32 p-3 text-start">Created At</th>
				<th class=" w-20 p-3 text-center">Version</th>
				<th class=" w-20 p-3 text-center">Actions</th>
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
						<td class=" text-center text-sm">
							<Popover.Root>
								<Popover.Trigger>
									<Button
										variant="ghost"
										onclick={() => toggleMenu(row.id)}
										class="rotate-90 items-center rounded-md p-2 "
									>
										⠇
									</Button>
								</Popover.Trigger>

								<Popover.Content class=" !flex !flex-col !items-start" sideOffset={-10}>
									{#if activeMenu === row.id}
										<Dialog.Root bind:open={isOpen}>
											<Dialog.Trigger class="{buttonVariants({ variant: 'ghost' })} w-36 justify-start" onclick={() => (isOpen = true)}>
												<Icon icon="material-symbols:edit-outline" width="24" height="24" />
												<span>Edit</span>
											</Dialog.Trigger>
											<Dialog.Content
												class=" scrollbar-hide max-h-[90%] max-w-[95%] overflow-y-auto rounded-md md:max-w-[85%] lg:max-w-[45%] "
											>
												<Dialog.Header>
													<Dialog.Title>Add New</Dialog.Title>
													<Dialog.Description>
														Make changes to your form template here. Click save when you're done.
													</Dialog.Description>
												</Dialog.Header>
												<form method="post" use:enhance>
													<TemplateForm templateData={row} bind:errors />
													<Dialog.Footer>
														<Button class="my-2" onclick={handleSubmit} type="submit"
															>Save changes</Button
														>
													</Dialog.Footer>
												</form>
											</Dialog.Content>
										</Dialog.Root>
										<div>
											<Button
												href="/users/{userId}/form-templates/{row.id}/preview"
												variant="ghost"
												class="w-36 justify-start"
												><Icon icon="icon-park-outline:preview-open" width="24" height="24" />
												<span>Preview</span>
											</Button>
										</div>

										<AlertDialog.Root>
											<AlertDialog.Trigger class="{buttonVariants({ variant: 'ghost' })} w-36 justify-start">
												<Icon icon="material-symbols:link" width="20" height="20" />
												<span>Generate Link</span>
											</AlertDialog.Trigger>
											<AlertDialog.Content>
												<AlertDialog.Header>
													<AlertDialog.Title>This is the link for the template</AlertDialog.Title>
													<AlertDialog.Description>
														Generate link to copy and share form template for data collection.
													</AlertDialog.Description>
												</AlertDialog.Header>
												<div class=" flex w-full items-center">
													<div class="relative w-full md:w-auto">
														<Input
															bind:value={link}
															type="text"
															class="w-76 overflow-x-auto whitespace-nowrap rounded-lg border px-4 py-2 pr-10 md:w-96 xl:w-96"
															readonly
														/>
														<Icon
															icon={copied
																? 'material-symbols:check-circle-rounded'
																: 'ion:copy-outline'}
															width="24"
															height="24"
															class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1"
															onclick={copyToClipboard}
														/>
													</div>
													<Button class="mx-1" onclick={() => createLink(row.id)}>Generate</Button>
												</div>

												<AlertDialog.Footer>
													<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
													<AlertDialog.Action onclick={openLink}>Open</AlertDialog.Action>
												</AlertDialog.Footer>
											</AlertDialog.Content>
										</AlertDialog.Root>

										<Button
											variant="ghost"
											class="w-36 justify-start"
											onclick={() => handleExportTemplate(row.id, row.Title)}
										>
											<Icon icon="material-symbols:download" width="20" height="20" />
											<span>Export</span>
										</Button>


										<AlertDialog.Root bind:open>
											<AlertDialog.Trigger class="{buttonVariants({ variant: 'ghost' })} w-36 justify-start">
												<Icon
													icon="material-symbols:delete-outline"
													class="text-red-500"
													width="24"
													height="24"
												/>
												<span>Delete</span>
											</AlertDialog.Trigger>
											<AlertDialog.Content>
												<AlertDialog.Header>
													<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
													<AlertDialog.Description>
														This action cannot be undone. Deleting will remove the template and all
														associated data.
													</AlertDialog.Description>
												</AlertDialog.Header>
												<AlertDialog.Footer>
													<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
													<AlertDialog.Action
														class="w-fit"
														onclick={() => handleDeleteAssessment(row.id)}
													>
														Delete
													</AlertDialog.Action>
												</AlertDialog.Footer>
											</AlertDialog.Content>
										</AlertDialog.Root>
									{/if}
								</Popover.Content>
							</Popover.Root>
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
		<Label for="itemsPerPage" class="mb-2">Items per page</Label>
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
		<Button onclick={() => changePage(-1)} disabled={currentPage === 1}>
			<Icon icon="material-symbols:chevron-left-rounded" width="20" height="20" />
		</Button>
		<Button
			onclick={() => changePage(1)}
			disabled={currentPage === Math.ceil(filteredTemplates.length / itemsPerPage)}
		>
			<Icon icon="material-symbols:chevron-right-rounded" width="20" height="20" />
		</Button>
	</div>
</div>
