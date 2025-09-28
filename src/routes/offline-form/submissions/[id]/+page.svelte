<script lang="ts">
	import { page } from '$app/state';
	import { IndexedDbStorageManager } from '$lib/utils/indexdb.store.manager';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import QuestionPaper from '$lib/components/submission/QuestionPaper.svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { invalidate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { IndexedDB } from '$lib/utils/indexedDB';
	import { offlineSubmissionQueue } from '$lib/utils/offline-submission-queue';
	import { offlineSyncManager } from '$lib/utils/offline-sync-manager';
	import { legacyOfflineSyncManager } from '$lib/utils/legacy-offline-sync';
	import { createSchema, questionResponseModels } from './apiFunctions';

	const id = page.params.id;
	let isSubmitted = $state(false);
	let answers = $state({});
	let errors = $state({});
	let formattedSubmittedOn = $state('');
	let templateInfo = $state();
	let template = $state<any>(null);
	// let formSubmissionId = data.submissionId;
	// let questionResponseData = $derived(data.questionResponses);
	let submissionStatus = $state();

	let submittedOn = $state();
	let cached = $state();

	const tokens = id.split('-');
	if (tokens.length < 3) {
		throw new Error('Invalid ID format');
	}
	const code = tokens[1];
	const encodedTemplateId = tokens[2];
	const templateId = atob(encodedTemplateId);

	let storage = new IndexedDbStorageManager('templates', 'template_list');
	const STORAGE_KEY = `Submission_${id}`; // Make storage key unique for each submission link
	const SESSION_KEY = `sessionId_${id}`; // Make session key unique as well
	const db = new IndexedDB<{ id: string; payload: any }>('form-submissions', 'unsaved_answers');

	onMount(() => {
		getTemplates(templateId);
	});

	async function getTemplates(templateId: string) {
		const stored = await storage.get(templateId);
		const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
		template = parsed;
	}


	$effect(() => {
		if (template) {
			if (template?.FormSections) {
				$inspect(template.FormSections[0].Subsections, 'Root Section Title');
			}
			if (template?.Data) {
				templateInfo = template.Data.FormSections[0].Subsections;
				$inspect(template.Data.FormSections[0].Subsections, 'Template DisplayCode from Data');
			}
		}
	});

	// $inspect(code, 'Offline code');
	// $inspect(templateInfo, 'templateInfo');

	const responseTypeMap = {
		Integer: 'IntegerValue',
		Float: 'FloatValue',
		Boolean: 'BooleanValue',
		Text: 'TextValue',
		TextArray: 'TextValue',
		SingleChoiceSelection: 'TextValue',
		MultiChoiceSelection: 'TextValue',
		Object: 'TextValue',
		File: 'FileResourceId',
		Date: 'DateTimeValue',
		DateTime: 'DateTimeValue',
		Rating: 'IntegerValue',
		Location: 'DateTimeValue',
		Range: 'IntegerValue',
		Height: 'FloatValue',
		Weight: 'FloatValue',
		PulseRate: 'FloatValue',
		BloodPressure: 'TextValue',
		Temperature: 'FloatValue'
	};

	$effect(() => {
		formattedSubmittedOn = submittedOn ? formatDate(submittedOn) : '';
	});

	function formatDate(submittedOn) {
		const date = new Date(submittedOn);
		return date.toLocaleString('en-IN', { dateStyle: 'long' });
	}

	// $effect(() => {
	// 	if (submissionStatus === 'Submitted') {
	// 		isSubmitted = true;
	// 	}
	// 	answers = Object.fromEntries(
	// 		(cached ?? []).map((item) => {
	// 			const responseTypeKey = responseTypeMap[item.Question.ResponseType] || 'TextValue';
	// 			return [item.Question.id, item[responseTypeKey] ?? null];
	// 		})
	// 	);
	// });

	$effect(() => {
		if (browser && !isSubmitted) {
			(async () => {
				await db.add({
					id: STORAGE_KEY,
					payload: {
						answers: structuredCloneSafe(answers)
					}
				});
			})();
		}
	});



	// async function handleSave(e, showToast = true) {
		async function handleSave(e, showToast = true, submissionId = null, encryptedKey = null) {
		e.preventDefault();

		if (!templateInfo || !Array.isArray(templateInfo) || templateInfo.length === 0) {
			console.error('templateInfo is not available or empty');
			addToast({
				message: 'Template data is not available. Please refresh the page.',
				type: 'error',
				timeout: 3000
			});
			return false;
		}

		const schema = createSchema(templateInfo);
		const validationResult = schema.safeParse(answers);

		if (!validationResult.success) {
			errors = Object.fromEntries(
				Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			addToast({
				message: 'Please fill in all required fields before saving.',
				type: 'error',
				timeout: 3000
			});
			return false;
		}
		errors = {};

		try {
			const questionResponses = await questionResponseModels(
				templateInfo,
				answers,
				submissionId || id, // Use submissionId if provided, otherwise fall back to id,
				templateId,
				cached
			);

			console.log('Question responses created:', JSON.stringify(questionResponses, null, 2));
			console.log('API request body:', JSON.stringify({
				questionResponses,
				formSubmissionKey: encryptedKey || id, // Use encrypted key if available, otherwise fall back to original URL parameter
				FormData: answers
			}, null, 2));

			const res = await fetch('/api/server/question-response', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					questionResponses,
					formSubmissionKey: encryptedKey || id, // Use encrypted key if available, otherwise fall back to original URL parameter,
					FormData: answers
				})
			});

			console.log('API response status:', res.status);
			const saveData = await res.json();
			console.log('API response data:', saveData);
			if (showToast) toastMessage(saveData);

			await db.add({ id: SESSION_KEY, payload: { sessionId: code } });
			await db.add({ id: STORAGE_KEY, payload: { answers: structuredCloneSafe(answers) } });

			await db.delete(STORAGE_KEY);
			// await db.clear();

			invalidate('app:allNodes');
			console.log('Data saved:', saveData);
			return true;
		} catch (error) {
			console.error('Error saving data:', error);
			addToast({
				message: 'Save failed. Please try again.',
				type: 'error',
				timeout: 3000
			});
			return false;
		}
	}

	async function handleSubmit() {
		try {
			const submissionTimestamp = new Date().toISOString();

			if (!navigator.onLine) {
				// Store in the existing IndexedDB for backward compatibility
				await db.add({
					id: STORAGE_KEY,
					payload: {
						intentToSubmit: true,
						Token: id, // Use the original URL parameter instead of templateId,
						FormData: structuredCloneSafe(answers),
						submissionTimestamp,
						FormTemplateId: templateId
					}
				});
				await db.add({ id: SESSION_KEY, payload: { sessionId: code } });

				// Also store in the new offline submission queue
				try {
					await offlineSubmissionQueue.addSubmission({
						formId: id,
						formName: template?.name || 'Offline Form Submission',
						submissionData: structuredCloneSafe(answers),
						submissionTimestamp,
						formType: 'offline',
						pageUrl: window.location.href
					});
				} catch (error) {
					console.error('Failed to add to offline submission queue:', error);
				}

				console.log('Cached for offline submission');
				addToast({
					message: 'You are offline. Changes will be saved locally and submitted when online.',
					type: 'info',
					timeout: 3000
				});
				return;
			}

			await db.delete(STORAGE_KEY);
			await db.add({
				id: STORAGE_KEY,
				payload: {
					FormData: structuredCloneSafe(answers),
					submissionTimestamp
				}
			});

			const saveSuccess = await handleSave({ preventDefault: () => {} }, false);
			if (!saveSuccess) return;

			const res = await fetch('/api/server/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					submissionKey: id, // Use the original URL parameter instead of templateId,
					FormData: answers,
					submissionTimestamp
				})
			});

			const submissionData = await res.json();
			toastMessage(submissionData);

			if (!submissionData?.message) {
				addToast({
					message: 'Submission successful.',
					type: 'success',
					timeout: 3000
				});
			}

			await db.clear();
			console.log('Cleared entire IndexedDB after submission');
			invalidate('app:allNodes');
			console.log('Submission successful:', submissionData);
		} catch (error) {
			console.error('Submission failed:', error);
			addToast({
				message: 'Submission failed. Please try again.',
				type: 'error',
				timeout: 3000
			});
		}
	}

	onMount(() => {
	// let submittedOn = $state(db.getAll(STORAGE_KEY)[0]?.payload?.submissionTimestamp);

		if (browser && !isSubmitted) {
			db.getAll().then((cachedData) => {
				cached = cachedData.find((item) => item.id === STORAGE_KEY)?.payload?.answers;
				submittedOn = cachedData.find((item) => item.id === STORAGE_KEY)?.payload?.submissionTimestamp;
				submissionStatus = cachedData.find((item) => item.id === STORAGE_KEY)?.payload?.intentToSubmit;
				if (cached) {
					try {
						answers = cached;
						console.log('Restored from IndexedDB');
						addToast({ message: 'Restored your unsaved answers.', type: 'info', timeout: 3000 });
					} catch (e) {
						console.warn('Failed to parse cached answers.');
					}
				}
			});

			const syncOfflineData = async () => {
				const cachedData = await db.getAll();
				// Find all submissions that need to be submitted (not just the current one)
				const submissionsToSync = cachedData.filter((item) => item.payload?.intentToSubmit);
				
				if (submissionsToSync.length > 0) {
					console.log(`Back online: auto-submitting ${submissionsToSync.length} cached submission(s)...`);
					
					// Process each submission that needs to be synced
					for (const cachedSubmit of submissionsToSync) {
						const formData = cachedSubmit.payload.FormData;
						const submissionToken = cachedSubmit.payload.Token;
						const submissionTimestamp = cachedSubmit.payload.submissionTimestamp;
						
						console.log(`Processing submission with token: ${submissionToken}`);
						
						// Parse the submission token to get template info
						const tokens = submissionToken.split('-');
						if (tokens.length < 3) {
							console.error('Invalid submission token format:', submissionToken);
							continue;
						}
						const submissionCode = tokens[1];
						const encodedTemplateId = tokens[2];
						const submissionTemplateId = atob(encodedTemplateId);
						
						// Load template for this specific submission
						let submissionTemplateInfo = null;
						try {
							const storedTemplate = await storage.get(submissionTemplateId);
							const parsedTemplate = typeof storedTemplate === 'string' ? JSON.parse(storedTemplate) : storedTemplate;
							if (parsedTemplate?.FormSections) {
								submissionTemplateInfo = parsedTemplate.FormSections[0].Subsections;
							} else if (parsedTemplate?.Data) {
								submissionTemplateInfo = parsedTemplate.Data.FormSections[0].Subsections;
							}
						} catch (err) {
							console.error('Failed to load template for submission:', submissionToken, err);
							continue;
						}

						if (!submissionTemplateInfo || !Array.isArray(submissionTemplateInfo) || submissionTemplateInfo.length === 0) {
							console.error('Template info not available for submission:', submissionToken);
							continue;
						}

						// Only update current form's answers if this is the current submission
						if (cachedSubmit.id === STORAGE_KEY) {
							answers = formData;
						}

						// First create a submission for offline forms
						let submissionId = null;
						let encryptedKey = null;
						try {
							const createSubmissionRes = await fetch('/api/server/submission', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									FormTemplateId: submissionTemplateId
								})
							});
							
							const createSubmissionData = await createSubmissionRes.json();
							console.log('Create submission response:', createSubmissionData);
							
							if (createSubmissionData.Status === 'success' && createSubmissionData.Data?.id) {
								submissionId = createSubmissionData.Data.id;
								encryptedKey = createSubmissionData.Data.Encrypted;
								console.log('Created submission ID:', submissionId);
								console.log('Created encrypted key:', encryptedKey);
							} else {
								throw new Error('Failed to create submission');
							}
						} catch (err) {
							console.error('Error creating submission:', err);
							addToast({
								message: `Failed to create submission for ${submissionToken}. Please try again.`,
								type: 'error',
								timeout: 3000
							});
							continue;
						}

						// Create question responses for this submission
						try {
							const questionResponses = await questionResponseModels(
								submissionTemplateInfo,
								formData,
								submissionId,
								submissionTemplateId,
								null
							);

							console.log('Question responses created:', JSON.stringify(questionResponses, null, 2));

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
							console.log('Data saved:', saveData);

							// Now submit the form
							console.log('Submitting form with encrypted key:', encryptedKey);
							const submitRes = await fetch('/api/server/submit', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									submissionKey: encryptedKey,
									FormData: formData,
									submissionTimestamp
								})
							});

							const submissionData = await submitRes.json();
							console.log('Submission successful for:', submissionToken, submissionData);
							
							// Remove this submission from IndexedDB after successful sync
							await db.delete(cachedSubmit.id);
							console.log('Removed synced submission from IndexedDB:', cachedSubmit.id);

							// Show success message only for current form
							if (cachedSubmit.id === STORAGE_KEY) {
								toastMessage(submissionData);
								if (!submissionData?.message) {
									addToast({
										message: 'Submission successful after reconnecting.',
										type: 'success',
										timeout: 3000
									});
								}
							}

						} catch (err) {
							console.error('Network lost during sync for submission:', submissionToken, err);
							// Keep the submission in IndexedDB for retry later
							addToast({
								message: `Network lost during sync for submission ${submissionToken}. Will retry later.`,
								type: 'error',
								timeout: 4000
							});
						}
					}
				} else {
					console.log('Back online: no submission intent found.');
				}

				invalidate('app:allNodes');
			};

			// Note: Global sync is now handled in +layout.svelte
			// Individual page sync is disabled to prevent conflicts
			// window.addEventListener('online', syncOfflineData);
			// return () => {
			// 	window.removeEventListener('online', syncOfflineData);
			// };
		}
	});

	async function syncAnswersToIndexedDB() {
		// Get existing data first to preserve important flags
		const existingData = await db.getAll();
		const currentSubmission = existingData.find((item) => item.id === STORAGE_KEY);
		
		// Preserve intentToSubmit and other submission-related data
		const preservedData = currentSubmission?.payload || {};
		
		// If submission is already marked for offline submission, don't overwrite it
		if (preservedData.intentToSubmit) {
			console.log('🔄 OFFLINE FORM: Skipping sync - submission already marked for offline sync');
			return;
		}
		
		await db.delete(STORAGE_KEY);
		await db.add({
			id: STORAGE_KEY,
			payload: {
				...preservedData, // Preserve existing submission data
				FormData: structuredCloneSafe(answers) // Update form data
			}
		});

		console.log('Answers synced with IndexedDB (preserving submission intent):', {
			answers,
			preservedIntentToSubmit: preservedData.intentToSubmit,
			preservedToken: preservedData.Token,
			preservedTimestamp: preservedData.submissionTimestamp
		});
	}
	$effect(() => {
		syncAnswersToIndexedDB();
	});

	function structuredCloneSafe<T>(obj: T): T {
		try {
			return structuredClone(obj);
		} catch {
			return JSON.parse(JSON.stringify(obj));
		}
	}
</script>

<h1>prashant kharade</h1>

<div class="flex flex-row">
	<div class="mx-auto mt-20 flex h-screen w-[80%] rounded-sm p-1">
		<form class="mx-auto w-[80%] space-y-3">
			<div
				class="relative mx-auto h-fit rounded-md border border-gray-500 bg-[#F6F8FA] pb-7 pt-5 dark:bg-[#0a0a0b]"
			>
				{#if template}
					<div>
						<p class="absolute right-4 top-2 mr-0 mt-0 leading-7">{template.Type}</p>
						<div class="flex h-full flex-col justify-center text-center">
							<h2 class="mt-5 text-center text-3xl font-bold">{template.Title}</h2>
							<div class="mt-2 w-full items-center justify-center text-wrap">
								<p class="mx-auto">{template.Description}</p>
								<p class="ml-auto mr-4 text-end text-sm">Version: {template.CurrentVersion}</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<div class="min-h-[390px] rounded-md border border-gray-500 bg-[#f9fafb] dark:bg-[#0a0a0b]">
				<QuestionPaper {answers} {errors} {isSubmitted} sections={templateInfo} />
			</div>

			<div class="mx-auto flex flex-col space-x-5 pb-32 pt-6 md:flex-row">
				<Button type="submit" variant="outline" class="w-full border" disabled={isSubmitted}
					>Save</Button
				>
				<Button
					onclick={handleSubmit}
					type="button"
					variant="secondary"
					class="btn h-10 w-full border"
					disabled={isSubmitted}
				>
					Submit
				</Button>
			</div>
		</form>
	</div>
</div>
