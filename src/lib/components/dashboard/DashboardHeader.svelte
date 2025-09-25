<script lang="ts">
	import Icon from '@iconify/svelte';
	import { IndexedDbStorageManager } from '$lib/utils/indexdb.store.manager';

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
	let showShareModal = $state(false);
	let link = $state('');
	let copied = $state(false);
	let qrCodeDataUrl = $state('');
	let showQRCode = $state(false);

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
		showShareModal = true;
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(link);
			copied = true;
			setTimeout(() => (copied = false), 2000);
			// You could add a toast notification here
			alert('Link copied to clipboard!');
		} catch (error) {
			alert('Failed to copy link');
		}
	}

	function openLink() {
		window.open(link, '_blank');
	}

	const createLink = async (templateId: string) => {
		try {
			if (!navigator.onLine) {
				console.warn('You are offline. Generating offline link...');
				try {
					const generalStorage = new IndexedDbStorageManager('general', 'environment_variables');
					const code = Math.random().toString(36).substring(2, 8);
					const encryptedId = btoa(templateId);
					const offlineLink = `offline-${code}-${encryptedId}`;
					const baseUrlObj = await generalStorage.get('this_base_url');
					if (baseUrlObj === null) {
						console.error('Base URL not found in IndexedDB');
						// Fallback to default URL
						link = `http://localhost:5173/offline-form/submissions/${offlineLink}`;
					} else {
						const baseUrl = baseUrlObj['this_base_url'] || 'http://localhost:5173';
						link = `${baseUrl}/offline-form/submissions/${offlineLink}`;
					}
					// Generate QR code for the offline link
					await generateQRCode(link);
					return link;
				} catch (indexedDbError) {
					console.error('IndexedDB Error:', indexedDbError);
					// Fallback to default URL if IndexedDB fails
					const code = Math.random().toString(36).substring(2, 8);
					const encryptedId = btoa(templateId);
					const offlineLink = `offline-${code}-${encryptedId}`;
					link = `http://localhost:5173/offline-form/submissions/${offlineLink}`;
					await generateQRCode(link);
					return link;
				}
			}

			const response = await fetch(`/api/server/submission`, {
				method: 'POST',
				body: JSON.stringify({ FormTemplateId: templateId }),
				headers: { 'Content-Type': 'application/json' }
			});
			const result = await response.json();
			if (result.HttpCode === 201 || result.State === 'success') {
				link = result?.Data?.Link;
				// Generate QR code for the link
				await generateQRCode(link);
			} else {
				alert('Failed to generate link');
			}
		} catch (error) {
			console.error('Submission Error:', error);
			alert('Error generating link');
			return null;
		}
	};

	function handleDeleteForm() {
		if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
			// Handle delete logic here
			console.log('Deleting form...');
			// You would typically make an API call to delete the form
		}
	}

	function closeModal() {
		showShareModal = false;
		link = '';
		qrCodeDataUrl = '';
		showQRCode = false;
	}

	// Simple QR code generation using a free API
	async function generateQRCode(url: string) {
		try {
			// Using qr-server.com API for simple QR code generation
			const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
			qrCodeDataUrl = qrUrl;
			showQRCode = true;
		} catch (error) {
			console.error('Error generating QR code:', error);
			alert('Failed to generate QR code');
		}
	}

	function downloadQRCode() {
		if (qrCodeDataUrl) {
			const link = document.createElement('a');
			link.href = qrCodeDataUrl;
			link.download = `form-qr-code-${templateId}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
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

<!-- Share Form Modal -->
{#if showShareModal}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && closeModal()}
	>
		<button 
			class="absolute inset-0 w-full h-full bg-transparent"
			onclick={closeModal}
			aria-label="Close modal"
		></button>
		<div 
			class="relative bg-white rounded-xl shadow-2xl w-[90vw] max-w-[700px] h-[85vh] mx-4 flex flex-col"
		>
			<!-- Modal Header -->
			<div class="p-6 border-b border-gray-200 flex-shrink-0">
				<div class="flex items-center justify-between">
					<div>
						<h3 id="modal-title" class="text-xl font-semibold text-gray-900">Share Form Template</h3>
						<p class="text-sm text-gray-600 mt-1">
							Generate a shareable link and QR code for your form template
						</p>
					</div>
					<button
						onclick={closeModal}
						class="p-2 hover:bg-gray-100 rounded-full transition-colors"
						aria-label="Close modal"
					>
						<Icon icon="lucide:x" class="w-5 h-5 text-gray-500" />
					</button>
				</div>
			</div>
			
			<!-- Modal Body -->
			<div class="p-6 flex flex-col">
				<!-- Link Generation Section -->
				<div class="mb-4">
					<label class="block text-sm font-medium text-gray-700 mb-2">Shareable Link</label>
					<div class="flex w-full items-center gap-3">
						<div class="relative flex-1">
							<input
								type="text"
								bind:value={link}
								readonly
								class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
								placeholder="Click 'Generate Link' to create a shareable link..."
							/>
							<button
								onclick={copyToClipboard}
								class="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
								title="Copy to clipboard"
								disabled={!link}
							>
								<Icon 
									icon={copied ? 'material-symbols:check-circle-rounded' : 'ion:copy-outline'} 
									class="w-5 h-5 {copied ? 'text-green-600' : 'text-gray-600'}"
								/>
							</button>
						</div>
						<button
							onclick={() => createLink(templateId)}
							class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
						>
							<Icon icon="lucide:link" class="w-4 h-4 inline mr-2" />
							Generate Link
						</button>
					</div>
				</div>

				<!-- QR Code Section -->
				{#if showQRCode && qrCodeDataUrl}
					<div class="flex flex-col items-center space-y-4">
						<div class="text-center">
							<h4 class="text-lg font-medium text-gray-800 mb-2">QR Code for Easy Sharing</h4>
							<p class="text-sm text-gray-600">Scan this QR code to quickly access the form</p>
						</div>
						<div class="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 shadow-sm">
							<img 
								src={qrCodeDataUrl} 
								alt="QR Code for form link" 
								class="w-48 h-48 object-contain"
								onerror={(e) => (e.target as HTMLImageElement).style.display = 'none'}
							/>
						</div>
						<div class="flex gap-3">
							<button
								onclick={downloadQRCode}
								class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors font-medium"
							>
								<Icon icon="lucide:download" class="w-4 h-4 inline mr-2" />
								Download QR
							</button>
							<button
								onclick={() => navigator.clipboard.writeText(link)}
								class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
							>
								<Icon icon="lucide:copy" class="w-4 h-4 inline mr-2" />
								Copy Link
							</button>
						</div>
					</div>
				{:else}
					<div class="flex-1 flex items-center justify-center">
						<div class="text-center text-gray-500">
							<Icon icon="lucide:qr-code" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
							<p class="text-lg font-medium">QR Code will appear here</p>
							<p class="text-sm">Generate a link first to see the QR code</p>
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Modal Footer -->
			<div class="flex justify-end gap-3 p-2 border-t border-gray-200 flex-shrink-0">
				<button
					onclick={closeModal}
					class="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
				>
					Close
				</button>
				<button
					onclick={openLink}
					disabled={!link}
					class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
				>
					<Icon icon="lucide:external-link" class="w-4 h-4 inline mr-2" />
					Open Link
				</button>
			</div>
		</div>
	</div>
{/if}
