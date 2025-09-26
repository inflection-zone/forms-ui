<script lang="ts">
	import LineChart from './charts/LineChart.svelte';
	import DoughnutChart from './charts/DoughnutChart.svelte';
	import Icon from '@iconify/svelte';

	let { 
		formData, 
		responseTrendData, 
		sourceData, 
		userId, 
		templateId 
	}: { 
		formData: any; 
		responseTrendData: any; 
		sourceData: any; 
		userId: string;
		templateId: string;
	} = $props();

	// Delete template state
	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);

	// Delete template function
	async function deleteTemplate() {
		if (!templateId) return;
		
		isDeleting = true;
		try {
			const response = await fetch(`/api/server/template/${templateId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				// Redirect to templates list after successful deletion
				window.location.href = `/users/${userId}/form-templates`;
			} else {
				console.error('Failed to delete template');
				alert('Failed to delete template. Please try again.');
			}
		} catch (error) {
			console.error('Error deleting template:', error);
			alert('An error occurred while deleting the template. Please try again.');
		} finally {
			isDeleting = false;
			showDeleteConfirm = false;
		}
	}

	function confirmDelete() {
		showDeleteConfirm = true;
	}

	function cancelDelete() {
		showDeleteConfirm = false;
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
	<div class="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border">
		<div class="text-3xl font-bold text-card-foreground mb-2">{formData.questions.toLocaleString()}</div>
		<div class="text-muted-foreground text-sm mb-2">Total Questions</div>
		<div class="text-blue-600 text-xs font-medium">Form structure</div>
	</div>
	<div class="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border">
		<div class="text-3xl font-bold text-card-foreground mb-2">{formData.totalResponses.toLocaleString()}</div>
		<div class="text-muted-foreground text-sm mb-2">Total Responses</div>
		<div class="text-green-600 text-xs font-medium">+18% from last week</div>
	</div>
	<!-- <div class="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border">
		<div class="text-3xl font-bold text-card-foreground mb-2">{formData.completionRate}%</div>
		<div class="text-muted-foreground text-sm mb-2">Completion Rate</div>
		<div class="text-green-600 text-xs font-medium">+2.1% improvement</div>
	</div>
	<div class="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border">
		<div class="text-3xl font-bold text-card-foreground mb-2">{formData.medianTime}</div>
		<div class="text-muted-foreground text-sm">Median Response Time</div>
	</div>
	<div class="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border">
		<div class="text-3xl font-bold text-card-foreground mb-2">{formData.highestDropoff}</div>
		<div class="text-muted-foreground text-sm">Highest Drop-off Question</div>
	</div> -->
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
	<div class="lg:col-span-2 bg-card p-6 rounded-xl shadow-sm border border-border">
		<h3 class="text-lg font-semibold mb-4 text-card-foreground">Response Trends</h3>
		<div class="h-72">
			<LineChart data={responseTrendData} options={{ plugins: { legend: { display: false } } }} />
		</div>
	</div>
	<div class="bg-card p-6 rounded-xl shadow-sm border border-border">
		<h3 class="text-lg font-semibold mb-4 text-card-foreground">Response Sources</h3>
		<div class="h-72">
			<DoughnutChart data={sourceData} />
		</div>
	</div>
</div>

<!-- DELETE SECTION -->
<div class="mt-6">
	<div class="bg-card rounded-xl shadow-sm border border-destructive/20 bg-destructive/5">
		<div class="p-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Once you delete this form template, there is no going back. All form data, responses, and configuration will be permanently lost. This action cannot be undone.
			</p>
			<button 
				id="delete-template-btn"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				onclick={confirmDelete}
				disabled={isDeleting}
			>
				{#if isDeleting}
					<Icon icon="lucide:loader-2" class="w-4 h-4 animate-spin" />
					Deleting...
				{:else}
					<Icon icon="lucide:trash-2" class="w-4 h-4" />
					Delete
				{/if}
			</button>
		</div>
	</div>
</div>

<!-- DELETE CONFIRMATION DIALOG -->
{#if showDeleteConfirm}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-card rounded-lg shadow-lg border border-border max-w-md w-full mx-4">
			<div class="p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="flex-shrink-0">
						<Icon icon="lucide:alert-triangle" class="w-6 h-6 text-destructive" />
					</div>
					<h3 class="text-lg font-semibold text-card-foreground">Delete Form Template</h3>
				</div>
				<p class="text-muted-foreground mb-6">
					Are you sure you want to delete "<strong>{formData.title}</strong>"? This action cannot be undone and will permanently delete all form data, responses, and configuration.
				</p>
				<div class="flex gap-3 justify-end">
					<button 
						id="cancel-delete-btn"
						class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						onclick={cancelDelete}
						disabled={isDeleting}
					>
						Cancel
					</button>
					<button 
						id="confirm-delete-btn"
						class="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						onclick={deleteTemplate}
						disabled={isDeleting}
					>
						{#if isDeleting}
							<Icon icon="lucide:loader-2" class="w-4 h-4 animate-spin inline mr-1" />
							Deleting...
						{:else}
							<Icon icon="lucide:trash-2" class="w-4 h-4 inline mr-1" />
							Delete Template
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
