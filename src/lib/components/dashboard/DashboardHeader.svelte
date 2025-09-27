<script lang="ts">
	import Icon from '@iconify/svelte';

	let { formData, userId, templateId }: {
		formData: {
			title: string;
			description?: string;
			created: string;
			lastModified: string;
			status: string;
			version?: string;
			displayCode?: string;
			type?: string;
			questions: number;
			isFavourite?: boolean;
		};
		userId: string;
		templateId: string;
	} = $props();

	let showTooltip = $state(false);
	let showFavoriteTooltip = $state(false);
	let isFavoriteLoading = $state(false);
	let isFavourite = $state(formData.isFavourite || false);

	function handleShareForm() {
		// Copy form URL to clipboard
		const formUrl = `${window.location.origin}/users/${userId}/form-templates/${templateId}/forms`;
		navigator.clipboard.writeText(formUrl).then(() => {
			// You could add a toast notification here
			alert('Form URL copied to clipboard!');
		});
	}

	async function handleFavoriteForm() {
		if (isFavoriteLoading) return; // Prevent multiple clicks
		
		try {
			isFavoriteLoading = true;
			
			// Toggle the favorite status
			const newFavoriteStatus = !isFavourite;
			
			const response = await fetch('/api/server/template/favorite', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: templateId,
					isFavourite: newFavoriteStatus
				})
			});
			
			const result = await response.json();
			
			if (response.ok && result.status === 'success') {
				// Update local state
				isFavourite = newFavoriteStatus;
				
				// Show success message
				alert(result.message || `Form ${newFavoriteStatus ? 'added to' : 'removed from'} favorites!`);
			} else {
				// Show error message
				alert(result.message || 'Failed to update favorite status');
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
			alert('Failed to update favorite status. Please try again.');
		} finally {
			isFavoriteLoading = false;
		}
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
		<div class="flex items-start justify-between gap-6">
			<!-- Title and Description Section -->
			<div class="flex-1">
				<div class="flex items-center justify-between mb-2">
					<h1 class="text-2xl font-semibold text-card-foreground">{formData.title}</h1>
					<div class="flex items-center gap-2">
						<div class="relative">
							<button
								class="p-1 hover:bg-accent rounded-md transition-colors"
								onclick={() => handleShareForm()}
								onmouseenter={() => (showTooltip = true)}
								onmouseleave={() => (showTooltip = false)}
							>
								<Icon icon="lucide:link" class="w-5 h-5 text-muted-foreground hover:text-foreground" />
							</button>
							{#if showTooltip}
								<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap z-50">
									Share Form
								</div>
							{/if}
						</div>
						<div class="relative">
							<button
								class="p-1 hover:bg-accent rounded-md transition-colors {isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}"
								onclick={() => handleFavoriteForm()}
								onmouseenter={() => (showFavoriteTooltip = true)}
								onmouseleave={() => (showFavoriteTooltip = false)}
								disabled={isFavoriteLoading}
							>
								{#if isFavoriteLoading}
									<Icon icon="lucide:loader-2" class="w-5 h-5 text-muted-foreground animate-spin" />
								{:else}
									<Icon 
										icon={isFavourite ? "material-symbols:star" : "material-symbols:star-outline"} 
										class="w-5 h-5 {isFavourite ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'}" 
									/>
								{/if}
							</button>
							{#if showFavoriteTooltip}
								<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap z-50">
									{isFavourite ? 'Remove from Favorites' : 'Add to Favorites'}
								</div>
							{/if}
						</div>
						<button
							class="p-1 hover:bg-accent rounded-md transition-colors"
							onclick={() => window.location.href = `/users/${userId}/form-templates/${templateId}/preview`}
							title="Preview Form"
						>
							<Icon icon="lucide:eye" class="w-5 h-5 text-muted-foreground hover:text-foreground" />
						</button>
					</div>
				</div>
				{#if formData.description}
					<p class="text-muted-foreground mb-4 text-sm leading-relaxed">{formData.description}</p>
				{/if}
				<div class="flex gap-6 text-muted-foreground text-sm flex-wrap">
					<span>Created: {formData.created}</span>
					<span>Last Modified: {formData.lastModified}</span>
					<span>Status: {formData.status}</span>
					<span>Questions: {formData.questions}</span>
					{#if formData.version}
						<span>Version: {formData.version}</span>
					{/if}
					{#if formData.type}
						<span>Type: {formData.type}</span>
					{/if}
				</div>
				{#if formData.displayCode}
					<div class="mt-2">
						<span class="text-xs text-muted-foreground">Display Code: </span>
						<code class="text-xs bg-muted px-2 py-1 rounded font-mono">{formData.displayCode}</code>
					</div>
				{/if}
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3 flex-shrink-0">
				<button 
					class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
					onclick={() => window.location.href = `/users/${userId}/form-templates/${templateId}/forms`}
				>
					<Icon icon="lucide:edit" class="w-4 h-4" />
					Edit Form
				</button>
			
			</div>
		</div>
	</div>
</div>
