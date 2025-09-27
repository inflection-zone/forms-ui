<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { addToast } from '$lib/components/toast/toast.store';
	import Toasts from '$lib/components/toast/toasts.svelte';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import { page } from '$app/state';
	import { getFlash } from 'sveltekit-flash-message';
	import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';
	import { IndexedDB } from '$lib/utils/indexedDB';
	import { IndexedDbStorageManager } from '$lib/utils/indexdb.store.manager';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	///////////////////////////////////////////////////////////////////////////

	var systemName = 'Form Builder and sharing service';

	let { children } = $props();
	const flash = getFlash(page);

	flash.subscribe(($flash) => {
		if (!$flash) return;
		addToast({
			type: $flash.type || 'info',
			message: $flash.message,
			dismissible: true,
			timeout: 3000
		});
		flash.set(undefined);
	});

	// Handle errors from any child routes
	let error = $state(null);
	let status = $state(200);

	$effect(() => {
		if (page.error) {
			error = page.error;
			status = page.status;
		} else {
			error = null;
			status = 200;
		}
	});

	// Global sync mechanism for offline submissions
	onMount(() => {
		if (browser) {
			const db = new IndexedDB<{ id: string; payload: any }>('form-submissions', 'unsaved_answers');
			const storage = new IndexedDbStorageManager('templates', 'template_list');

			const syncAllOfflineSubmissions = async () => {
				try {
					const cachedData = await db.getAll();
					const submissionsToSync = cachedData.filter((item) => item.payload?.intentToSubmit);
					
					if (submissionsToSync.length > 0) {
						console.log(`🔄 Global sync: Found ${submissionsToSync.length} submissions to sync...`);
						
						// Sort submissions by timestamp to identify the first one created
						const sortedSubmissions = submissionsToSync.sort((a, b) => {
							const timeA = new Date(a.payload?.submissionTimestamp || 0).getTime();
							const timeB = new Date(b.payload?.submissionTimestamp || 0).getTime();
							return timeA - timeB;
						});
						
						let successCount = 0;
						let failureCount = 0;
						
						for (let index = 0; index < sortedSubmissions.length; index++) {
							const cachedSubmit = sortedSubmissions[index];
							
							try {
								const formData = cachedSubmit.payload.FormData;
								const submissionToken = cachedSubmit.payload.Token;
								const submissionTimestamp = cachedSubmit.payload.submissionTimestamp;
								
								console.log(`🔄 Syncing submission ${index + 1}/${sortedSubmissions.length}: ${submissionToken}`);
								
								// Check if this is an offline submission or regular submission
								const isOfflineSubmission = submissionToken.startsWith('offline-');
								
								if (isOfflineSubmission) {
									// Handle offline submissions
									const tokens = submissionToken.split('-');
									if (tokens.length < 3) {
										throw new Error(`Invalid token format: ${submissionToken}`);
									}
									
									const submissionCode = tokens[1];
									const encodedTemplateId = tokens[2];
									
									let submissionTemplateId;
									try {
										submissionTemplateId = atob(encodedTemplateId);
									} catch (err) {
										throw new Error(`Failed to decode template ID: ${encodedTemplateId}`);
									}
									
									// Load template for this submission
									let submissionTemplateInfo = null;
									try {
										const storedTemplate = await storage.get(submissionTemplateId);
										
										if (!storedTemplate) {
											throw new Error(`Template not found in storage: ${submissionTemplateId}`);
										}
										
										const parsedTemplate = typeof storedTemplate === 'string' ? JSON.parse(storedTemplate) : storedTemplate;
										if (parsedTemplate?.FormSections) {
											submissionTemplateInfo = parsedTemplate.FormSections[0].Subsections;
										} else if (parsedTemplate?.Data) {
											submissionTemplateInfo = parsedTemplate.Data.FormSections[0].Subsections;
										} else {
											throw new Error('Template structure invalid - no FormSections found');
										}
									} catch (err) {
										throw new Error(`Template loading failed: ${err.message}`);
									}

									if (!submissionTemplateInfo || !Array.isArray(submissionTemplateInfo) || submissionTemplateInfo.length === 0) {
										throw new Error('Template info not available or empty');
									}

									// Create submission first
									const createSubmissionRes = await fetch('/api/server/submission', {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({
											FormTemplateId: submissionTemplateId
										})
									});
									
									const createSubmissionData = await createSubmissionRes.json();
									
									if (createSubmissionData.Status !== 'success' || !createSubmissionData.Data?.id) {
										throw new Error(`Failed to create submission: ${createSubmissionData.Message || 'Unknown error'}`);
									}
									
									const submissionId = createSubmissionData.Data.id;
									const encryptedKey = createSubmissionData.Data.Encrypted;

									// Import the questionResponseModels function dynamically
									const { questionResponseModels } = await import('./offline-form/submissions/[id]/apiFunctions');
									
									const questionResponses = await questionResponseModels(
										submissionTemplateInfo,
										formData,
										submissionId,
										submissionTemplateId,
										null
									);

									// Save question responses
									const saveRes = await fetch('/api/server/question-response', {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({
											questionResponses,
											formSubmissionKey: encryptedKey,
											FormData: formData
										})
									});
									const saveData = await saveRes.json();
									
									if (!saveRes.ok) {
										throw new Error(`Failed to save question responses: ${saveData.Message || saveRes.statusText}`);
									}

									// Submit the form
									const submitRes = await fetch('/api/server/submit', {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({
											submissionKey: encryptedKey,
											FormData: formData,
											submissionTimestamp
										})
									});
									const submitData = await submitRes.json();
									
									if (!submitRes.ok) {
										throw new Error(`Failed to submit form: ${submitData.Message || submitRes.statusText}`);
									}
									
								} else {
									// Handle regular submissions (created online but submitted offline)
									// For regular submissions, we need to create question responses first, then save and submit
									try {
										// Get submission details first to get the template ID
										console.log(`🔍 Getting submission details for token: ${submissionToken}`);
										const submissionRes = await fetch(`/api/server/submission/search?encrypted=${submissionToken}`);
										
										if (!submissionRes.ok) {
											throw new Error(`Failed to fetch submission details: ${submissionRes.status} ${submissionRes.statusText}`);
										}
										
										const submissionData = await submissionRes.json();
										console.log('📋 Submission data received:', submissionData);
										
										if (submissionData.Status !== 'success' || !submissionData.Data?.Items?.[0]) {
											throw new Error('Failed to get submission details from server');
										}
										
										const submission = submissionData.Data.Items[0];
										const templateId = submission.FormTemplateId;
										const submissionId = submission.id;
										
										// Get template info for regular submissions
										let submissionTemplateInfo = null;
										try {
											console.log(`🔍 Getting template details for templateId: ${templateId}`);
											// Get template details using the template ID from submission
											const templateRes = await fetch(`/api/server/template/${templateId}/details`);
											
											if (!templateRes.ok) {
												throw new Error(`Failed to fetch template details: ${templateRes.status} ${templateRes.statusText}`);
											}
											
											const templateData = await templateRes.json();
											console.log('📋 Template data received:', templateData);
											
											if (templateData.Status === 'success' && templateData.Data?.FormSections) {
												submissionTemplateInfo = templateData.Data.FormSections[0].Subsections;
											} else {
												throw new Error(`Template loading failed: ${templateData.Message || 'Invalid template data structure'}`);
											}
										} catch (err) {
											throw new Error(`Template loading failed: ${err.message}`);
										}

										if (!submissionTemplateInfo || !Array.isArray(submissionTemplateInfo) || submissionTemplateInfo.length === 0) {
											throw new Error('Template info not available or empty');
										}

										// Import the questionResponseModels function for regular submissions
										const { questionResponseModels } = await import('./form/submission/[id]/apiFunctions');
										
										// Create question responses for regular submissions
										const questionResponses = await questionResponseModels(
											submissionTemplateInfo,
											formData,
											submissionId, // Use the actual submission ID
											templateId, // Use the actual template ID
											null // No existing question response data
										);

										console.log('Question responses created for regular submission:', JSON.stringify(questionResponses, null, 2));

										// Save question responses
										const saveRes = await fetch('/api/server/question-response', {
											method: 'POST',
											headers: { 'Content-Type': 'application/json' },
											body: JSON.stringify({
												questionResponses,
												formSubmissionKey: submissionToken,
												FormData: formData
											})
										});
										
										const saveData = await saveRes.json();
										
										if (!saveRes.ok) {
											throw new Error(`Failed to save question responses: ${saveData.Message || saveRes.statusText}`);
										}

										// Submit the form - this is the critical part
										const submitRes = await fetch('/api/server/submit', {
											method: 'POST',
											headers: { 'Content-Type': 'application/json' },
											body: JSON.stringify({
												submissionKey: submissionToken,
												FormData: formData,
												submissionTimestamp
											})
										});
										
										const submitData = await submitRes.json();
										
										if (!submitRes.ok) {
											throw new Error(`Failed to submit form: ${submitData.Message || submitRes.statusText}`);
										}
										
									} catch (apiError) {
										throw new Error(`Regular submission API error: ${apiError.message}`);
									}
								}
								
								// Remove successfully synced submission
								await db.delete(cachedSubmit.id);
								successCount++;
								console.log(`✅ Successfully synced: ${submissionToken}`);
								
							} catch (err) {
								failureCount++;
								console.error(`❌ SYNC FAILED for submission: ${cachedSubmit.payload.Token}`, err.message);
							}
						}
						
						// Show summary toast
						if (successCount > 0) {
							addToast({
								message: `✅ Successfully synced ${successCount} submission(s) to database${failureCount > 0 ? `. ${failureCount} failed and will retry later.` : '.'}`,
								type: 'success',
								timeout: 5000
							});
						}
						
						if (failureCount > 0 && successCount === 0) {
							addToast({
								message: `❌ Failed to sync ${failureCount} submission(s). Will retry when connection is stable.`,
								type: 'error',
								timeout: 5000
							});
						}
					} else {
						console.log('Back online: no submission intent found.');
					}
				} catch (error) {
					console.error('❌ Global sync error:', error);
				}
			};

			// Listen for online events globally
			window.addEventListener('online', syncAllOfflineSubmissions);
			
			// Debug function to inspect IndexedDB contents
			(window as any).debugOfflineSubmissions = async () => {
				const cachedData = await db.getAll();
				const submissionsToSync = cachedData.filter((item) => item.payload?.intentToSubmit);
				
				console.log('🔍 DEBUG: All cached data:', cachedData);
				console.log('🔍 DEBUG: Submissions to sync:', submissionsToSync);
				
				submissionsToSync.forEach((submission, index) => {
					const token = submission.payload?.Token || '';
					const isOfflineSubmission = token.startsWith('offline-');
					console.log(`🔍 DEBUG: Submission ${index + 1}:`, {
						id: submission.id,
						token: token,
						type: isOfflineSubmission ? 'OFFLINE-GENERATED' : 'ONLINE-GENERATED',
						hasFormData: !!submission.payload?.FormData,
						formDataKeys: Object.keys(submission.payload?.FormData || {}),
						timestamp: submission.payload?.submissionTimestamp,
						intentToSubmit: submission.payload?.intentToSubmit
					});
				});
				
				return { total: cachedData.length, toSync: submissionsToSync.length };
			};

			// Also run sync immediately if already online and there are cached submissions
			if (navigator.onLine) {
				// Small delay to ensure page is fully loaded
				setTimeout(syncAllOfflineSubmissions, 1000);
			}
			
			return () => {
				window.removeEventListener('online', syncAllOfflineSubmissions);
			};
		}
	});
</script>

<svelte:head>
	<title>{systemName}</title>
	<meta name="description" content="Form Service" />
</svelte:head>

<Toasts />
<ModeWatcher />

<div class="flex flex-col">
	<Navbar />
	<div class="h-full">
		{#if error}
			<ErrorBoundary {error} {status} />
		{:else}
			{@render children()}
		{/if}
	</div>
</div>
