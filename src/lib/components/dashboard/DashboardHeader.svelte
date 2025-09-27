<script lang="ts">
	import Icon from '@iconify/svelte';
	import { IndexedDbStorageManager } from '$lib/utils/indexdb.store.manager';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { Helper } from '$lib/utils/helper';
	import { goto } from '$app/navigation';

	let { formData, userId, templateId } = $props();

	let activeTab = $state('');
	let showShareModal = $state(false);
	let link = $state('');
	let copied = $state(false);
	let qrCodeDataUrl = $state('');
	let showQRCode = $state(false);

	// New share modal state
	let shareTab = $state('one'); // 'one' or 'many'
	let expirationValue = $state(10);
	let expirationUnit = $state('Days');
	let linkType = $state('single'); // 'single' or 'multiple'
	let multipleLinkCount = $state(10);
	let emailAddresses = $state('');
	let singleEmailAddress = $state('');
	let showEmailInput = $state(false);
	let generatedLinks = $state([]);
    let showShareTooltip = $state(false);
    let showPreviewTooltip = $state(false);
    let showFavoriteTooltip = $state(false);
    let isFavoriteLoading = $state(false);
    let isFavourite = $state(formData.isFavourite || false);
	let showTooltip = $state(false);
	const tabs = [
		{ id: 'edit', label: 'Edit Form', icon: 'lucide:edit' },
		{ id: 'favorite', label: 'Favorite', icon: 'lucide:heart' },
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
			case 'favorite':
				handleFavoriteForm();
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
			addToast({
				message: 'Link copied to clipboard!',
				type: 'success',
				timeout: 3000
			});
		} catch (error) {
			addToast({
				message: 'Failed to copy link',
				type: 'error',
				timeout: 3000
			});
		}
	}

	function openLink() {
		window.open(link, '_blank');
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

	function closeModal() {
		showShareModal = false;
		link = '';
		qrCodeDataUrl = '';
		showQRCode = false;
		// Reset new share modal state
		shareTab = 'one';
		expirationValue = 10;
		expirationUnit = 'Days';
		linkType = 'single';
		multipleLinkCount = 10;
		emailAddresses = '';
		singleEmailAddress = '';
		showEmailInput = false;
		generatedLinks = [];
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
			addToast({
				message: 'Failed to generate QR code',
				type: 'error',
				timeout: 3000
			});
		}
	}

	// New functions for enhanced share functionality
	async function generateSingleLink() {
		try {
			const response = await fetch('/api/server/share-link', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					formId: templateId,
					shareType: 'single',
					expiresInValue: expirationValue,
					expiresInUnit: expirationUnit.toLowerCase()
				})
			});

			const result = await response.json();
			if (result.HttpCode === 201) {
				link = result.Data.shareUrl;
				await generateQRCode(link);
			} else {
				addToast({
					message: 'Failed to generate link',
					type: 'error',
					timeout: 3000
				});
			}
		} catch (error) {
			console.error('Error generating single link:', error);
			addToast({
				message: 'Error generating single link',
				type: 'error',
				timeout: 3000
			});
		}
	}

	async function generateMultipleLinks() {
		try {
			const response = await fetch('/api/server/share-link', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					formId: templateId,
					shareType: 'multiple',
					expiresInValue: expirationValue,
					expiresInUnit: expirationUnit.toLowerCase(),
					multipleLinksCount: multipleLinkCount
				})
			});

			const result = await response.json();
			if (result.HttpCode === 201) {
				generatedLinks = result.Data.multipleUrls || [];
			} else {
				addToast({
					message: 'Failed to generate multiple links',
					type: 'error',
					timeout: 3000
				});
			}
		} catch (error) {
			console.error('Error generating multiple links:', error);
			addToast({
				message: 'Error generating multiple links',
				type: 'error',
				timeout: 3000
			});
		}
	}

	async function copyAllLinks() {
		if (generatedLinks.length > 0) {
			try {
				await navigator.clipboard.writeText(generatedLinks.join('\n'));
				copied = true;
				setTimeout(() => (copied = false), 2000);
				addToast({
					message: 'All links copied to clipboard!',
					type: 'success',
					timeout: 3000
				});
			} catch (error) {
				addToast({
					message: 'Failed to copy links',
					type: 'error',
					timeout: 3000
				});
			}
		}
	}

	async function sendEmailLinks() {
		if (emailAddresses.trim()) {
			const emails = emailAddresses
				.split(',')
				.map((email) => email.trim())
				.filter((email) => email);
			if (emails.length > 0) {
				try {
					// Create share link with email list
					const response = await fetch('/api/server/share-link', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							formId: templateId,
							shareType: 'single',
							expiresInValue: expirationValue,
							expiresInUnit: expirationUnit.toLowerCase(),
							emailList: emailAddresses
						})
					});

					const result = await response.json();
					if (result.HttpCode === 201) {
						// Send email with the link
						await sendEmailWithLink(result.Data.shareUrl, emails);
						addToast({
							message: `Email sent to ${emails.length} recipients`,
							type: 'success',
							timeout: 3000
						});
					} else {
						addToast({
							message: 'Failed to create share link',
							type: 'error',
							timeout: 3000
						});
					}
				} catch (error) {
					console.error('Error sending email links:', error);
					addToast({
						message: 'Error sending email links',
						type: 'error',
						timeout: 3000
					});
				}
			}
		} else {
			addToast({
				message: 'Please enter email addresses',
				type: 'error',
				timeout: 3000
			});
		}
	}

	async function sendEmailWithLink(shareUrl: string, emails: string[]) {
		try {
			for (const email of emails) {
				await fetch('/api/server/share-link/send-link', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						FormTemplateId: templateId,
						EmailTo: email,
						Message: 'Please fill out this form using the link provided.'
					})
				});
			}
		} catch (error) {
			console.error('Error sending emails:', error);
		}
	}

	async function sendSingleEmail() {
		if (singleEmailAddress.trim() && link) {
			try {
				await fetch('/api/server/share-link/send-link', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						FormTemplateId: templateId,
						EmailTo: singleEmailAddress.trim(),
						Message: 'Please fill out this form using the link provided.'
					})
				});

				addToast({
					message: `Email sent to ${singleEmailAddress.trim()}`,
					type: 'success',
					timeout: 3000
				});

				// Clear the email input and hide the input field after successful send
				singleEmailAddress = '';
				showEmailInput = false;
			} catch (error) {
				console.error('Error sending single email:', error);
				addToast({
					message: 'Failed to send email',
					type: 'error',
					timeout: 3000
				});
			}
		} else {
			addToast({
				message: 'Please enter a valid email address',
				type: 'error',
				timeout: 3000
			});
		}
	}
</script>

<div class="mb-6 rounded-xl bg-card shadow-sm">
	<!-- Header Info -->
	<div class="pb-2">
		<div class="">
			<!-- Title and Description Section -->
			<div class="flex-1">
				<div class="flex items-end justify-between">
					<div class="flex items-end gap-3">
						<h1 class="text-4xl font-semibold text-foreground leading-tight">{formData.title}</h1>
						{#if formData.description}
							<span class="text-sm text-muted-foreground mb-1">- {Helper.truncateText(formData.description, 50)}</span>
						{/if}
					</div>
					<div class="flex items-center">
						<div class="relative">
						<button
							class="p-2 hover:bg-accent rounded-md transition-colors"
							onclick={() => handleShareForm()}
							onmouseenter={() => (showShareTooltip = true)}
							onmouseleave={() => (showShareTooltip = false)}
							title="Share Form"
						>
								<Icon icon="material-symbols:share" class="w-5 h-5 text-muted-foreground hover:text-foreground" />
							</button>
							{#if showShareTooltip}
								<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap z-50">
									Share Form
								</div>
							{/if}
						</div>
						<div class="relative">
						<button
							class="p-2 hover:bg-accent rounded-md transition-colors {isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}"
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
						<div class="relative">
							<button
								class="p-2 hover:bg-accent rounded-md transition-colors"
								onclick={() => goto(`/users/${userId}/form-templates/${templateId}/preview`)}
								title="Preview Form"
								onmouseenter={() => (showPreviewTooltip = true)}
								onmouseleave={() => (showPreviewTooltip = false)}
							>
								<Icon icon="lucide:eye" class="w-5 h-5 text-muted-foreground hover:text-foreground" />
							</button>
							{#if showPreviewTooltip}
								<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap z-50">
									Preview Form
								</div>
							{/if}
						</div>
						<button 
							class="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
							onclick={() =>goto(`/users/${userId}/form-templates/${templateId}/forms`)}
							title="Edit Form"
						>
							<Icon icon="lucide:edit" class="w-4 h-4" />
							<span class="hidden sm:inline">Edit</span>
						</button>
					</div>
				</div>
				<div class="flex gap-6 text-muted-foreground text-sm flex-wrap mt-2">
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
			class="absolute inset-0 h-full w-full bg-transparent"
			onclick={closeModal}
			aria-label="Close modal"
		></button>
		<div
			class="relative mx-4 flex h-[85vh] w-[90vw] max-w-[800px] flex-col rounded-xl bg-white shadow-2xl"
		>
			<!-- Modal Header -->
			<div class="flex-shrink-0 border-b border-gray-200 p-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<Icon icon="lucide:share" class="h-6 w-6 text-blue-600" />
						<h3 id="modal-title" class="text-xl font-semibold text-gray-900">
							Share submission link
						</h3>
					</div>
					<button
						onclick={closeModal}
						class="rounded-full p-2 transition-colors hover:bg-gray-100"
						aria-label="Close modal"
					>
						<Icon icon="lucide:x" class="h-5 w-5 text-gray-500" />
					</button>
				</div>
			</div>

			<!-- Modal Body -->
			<div class="flex flex-1 flex-col overflow-y-auto p-6">
				<!-- Expiration Settings -->
				<div class="mb-6">
					<label for="expiration-value" class="mb-3 block text-sm font-medium text-gray-500"
						>Expires in</label
					>
					<div class="flex items-center gap-3">
						<input
							id="expiration-value"
							type="number"
							bind:value={expirationValue}
							min="1"
							class="w-20 rounded-lg border border-primary px-3 py-2 text-gray-500"
						/>
						<select
							bind:value={expirationUnit}
							class="rounded-lg border border-primary px-3 py-2 text-gray-500"
						>
							<option value="Minutes">Minutes</option>
							<option value="Hours">Hours</option>
							<option value="Days">Days</option>
							<option value="Weeks">Weeks</option>
							<option value="Months">Months</option>
						</select>
					</div>
				</div>

				<!-- Share Tabs -->
				<div class="mb-6">
					<div class="flex border-b border-gray-200">
						<button
							onclick={() => (shareTab = 'one')}
							class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors {shareTab ===
							'one'
								? 'border-blue-600 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'}"
						>
							<Icon icon="lucide:user" class="h-4 w-4" />
							Share to One
						</button>
						<button
							onclick={() => (shareTab = 'many')}
							class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors {shareTab ===
							'many'
								? 'border-blue-600 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'}"
						>
							<Icon icon="lucide:users" class="h-4 w-4" />
							Share to Many
						</button>
					</div>
				</div>

				<!-- Share to One Section -->
				{#if shareTab === 'one'}
					<div class="flex flex-1 flex-col">
						<!-- Single Link Option -->
						<div class="mb-6">
							<div class="mb-4 flex items-center gap-3">
								<input
									type="radio"
									id="single-link"
									bind:group={linkType}
									value="single"
									class="h-4 w-4 text-blue-600"
								/>
								<label for="single-link" class="text-sm font-medium text-gray-700"
									>Single Link</label
								>
							</div>

							{#if linkType === 'single'}
								<div class="space-y-4">
									<div class="flex items-center gap-3">
										<input
											type="text"
											bind:value={link}
											readonly
											class="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm"
											placeholder="Generated link will appear here..."
										/>
										<button
											onclick={() => createLink(templateId)}
											class="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
										>
											Generate
										</button>
									</div>

									{#if link}
										<div class="flex items-center gap-2">
											<button
												onclick={copyToClipboard}
												class="rounded-lg p-2 transition-colors hover:bg-gray-100"
												title="Copy link"
											>
												<Icon icon="lucide:copy" class="h-4 w-4 text-gray-600" />
											</button>
											<button
												onclick={openLink}
												class="rounded-lg p-2 transition-colors hover:bg-gray-100"
												title="Open link"
											>
												<Icon icon="lucide:external-link" class="h-4 w-4 text-gray-600" />
											</button>
											<button
												onclick={() => (showEmailInput = !showEmailInput)}
												class="rounded-lg p-2 transition-colors hover:bg-gray-100 {showEmailInput
													? 'bg-blue-100'
													: ''}"
												title="Email link"
											>
												<Icon icon="lucide:mail" class="h-4 w-4 text-gray-600" />
											</button>
										</div>

										<!-- Email Input for Single Share -->
										{#if showEmailInput}
											<div class="mt-4">
												<label
													for="single-email"
													class="mb-2 block text-sm font-medium text-gray-700"
													>Send link via email</label
												>
												<div class="flex items-center gap-2">
													<input
														id="single-email"
														type="email"
														bind:value={singleEmailAddress}
														placeholder="Enter email address..."
														class="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
													/>
													<button
														onclick={sendSingleEmail}
														class="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
														disabled={!singleEmailAddress.trim()}
													>
														Send
													</button>
												</div>
											</div>
										{/if}

										<!-- QR Code -->
										{#if showQRCode && qrCodeDataUrl}
											<div class="flex justify-center">
												<div class="rounded-lg border-2 border-dashed border-gray-300 p-4">
													<img src={qrCodeDataUrl} alt="QR Code" class="h-32 w-32 object-contain" />
												</div>
											</div>
										{/if}
									{/if}
								</div>
							{/if}
						</div>

						<!-- Multiple Links Option -->
						<div>
							<div class="mb-4 flex items-center gap-3">
								<input
									type="radio"
									id="multiple-links"
									bind:group={linkType}
									value="multiple"
									class="h-4 w-4 text-blue-600"
								/>
								<label for="multiple-links" class="text-sm font-medium text-gray-700"
									>Multiple Links</label
								>
							</div>

							{#if linkType === 'multiple'}
								<div class="space-y-4">
									<div class="flex items-center gap-3">
										<input
											type="number"
											bind:value={multipleLinkCount}
											min="1"
											max="100"
											class="w-20 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
										<button
											onclick={generateMultipleLinks}
											class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
										>
											Generate
										</button>
									</div>

									{#if generatedLinks.length > 0}
										<div class="rounded-lg border-2 border-dashed border-gray-300 p-4">
											<div class="space-y-2">
												{#each generatedLinks as generatedLink, index}
													<div class="break-all text-sm text-gray-700">
														{generatedLink}
													</div>
												{/each}
											</div>
										</div>

										<div class="flex items-center gap-2">
											<button
												onclick={copyAllLinks}
												class="rounded-lg p-2 transition-colors hover:bg-gray-100"
												title="Copy all links"
											>
												<Icon icon="lucide:copy" class="h-4 w-4 text-gray-600" />
											</button>
											<button
												onclick={sendEmailLinks}
												class="rounded-lg p-2 transition-colors hover:bg-gray-100"
												title="Email links"
											>
												<Icon icon="lucide:mail" class="h-4 w-4 text-gray-600" />
											</button>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Share to Many Section -->
				{#if shareTab === 'many'}
					<div class="flex flex-1 flex-col">
						<div class="mb-4">
							<label for="email-addresses" class="mb-2 block text-sm font-medium text-gray-700"
								>Add / Paste email addresses here</label
							>
							<textarea
								id="email-addresses"
								bind:value={emailAddresses}
								placeholder="Enter email addresses separated by commas..."
								class="h-32 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
							></textarea>
						</div>

						<div class="flex items-center gap-2">
							<button
								onclick={sendEmailLinks}
								class="rounded-lg bg-primary p-2 transition-colors"
								title="Send email"
							>
								<Icon icon="material-symbols:send" class="h-5 w-5 text-foreground" />
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

