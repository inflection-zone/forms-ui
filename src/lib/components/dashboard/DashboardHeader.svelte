<script lang="ts">
	import Icon from '@iconify/svelte';

	let { formData, userId, templateId }: {
		formData: {
			title: string;
			created: string;
			lastModified: string;
			status: string;
			questions: number;
		};
		userId: string;
		templateId: string;
	} = $props();

	let activeTab = $state('');

	const tabs = [
		{ id: 'edit', label: 'Edit Form', icon: 'lucide:edit' },
		{ id: 'preview', label: 'Preview', icon: 'lucide:eye' },
		{ id: 'share', label: 'Share Form', icon: 'lucide:share' },
		{ id: 'delete', label: 'Delete', icon: 'lucide:trash-2' }
	];

	function handleTabClick(tabId: string) {
		activeTab = tabId;
		
		// Handle specific tab actions
		switch (tabId) {
			case 'edit':
				window.location.href = `/users/${userId}/form-templates/${templateId}/forms`;
				break;
			case 'preview':
				// Open preview in new tab
				window.open(`/users/${userId}/form-templates/${templateId}/preview`, '_blank');
				break;
			case 'share':
				// Handle share functionality
				handleShareForm();
				break;
			case 'delete':
				// Handle delete confirmation
				handleDeleteForm();
				break;
		}
	}

	function handleShareForm() {
		// Copy form URL to clipboard
		const formUrl = `${window.location.origin}/users/${userId}/form-templates/${templateId}/forms`;
		navigator.clipboard.writeText(formUrl).then(() => {
			// You could add a toast notification here
			alert('Form URL copied to clipboard!');
		});
	}

	function handleDeleteForm() {
		if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
			// Handle delete logic here
			console.log('Deleting form...');
			// You would typically make an API call to delete the form
		}
	}
</script>

<div class="bg-card rounded-xl mb-6 shadow-sm border border-border">
	<!-- Header Info -->
	<div class="p-6 border-b border-border">
		<h1 class="text-2xl font-semibold mb-4 text-card-foreground">{formData.title}</h1>
		<div class="flex gap-6 text-muted-foreground text-sm flex-wrap">
			<span>Created: {formData.created}</span>
			<span>Last Modified: {formData.lastModified}</span>
			<span>Status: {formData.status}</span>
			<span>Questions: {formData.questions}</span>
		</div>
	</div>

	<!-- Action Tabs -->
	<div class="p-1">
		<div class="flex">
			{#each tabs as tab}
				<button 
					class="group flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-md transition-colors {activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}"
					onclick={() => handleTabClick(tab.id)}
				>
					<Icon 
						icon={tab.icon} 
						class="w-4 h-4 transition-colors {activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'}" 
					/>
					{tab.label}
				</button>
			{/each}
		</div>
	</div>
</div>
