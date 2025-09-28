<script lang="ts">
	import type { PageServerData } from './$types';
	// import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { createSchema, questionResponseModels } from './apiFunctions';
	import QuestionPaper from '$lib/components/submission/QuestionPaper.svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { invalidate } from '$app/navigation';
	import { cleanAssessmentTemplate } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { IndexedDB } from '$lib/utils/indexedDB';
	import { offlineSubmissionQueue } from '$lib/utils/offline-submission-queue';
	import { offlineSyncManager } from '$lib/utils/offline-sync-manager';
	import { legacyOfflineSyncManager } from '$lib/utils/legacy-offline-sync';
	import { page } from '$app/state';

	let { data }: { data: PageServerData } = $props();

	console.log('Data is ', data);

	//     const form = createMedicalAssessmentForm();
	// const executor = new FormRuleExecutor(form);

	const formSubmissionKey = page.params.id;
	let section = $state(data.assessmentTemplate.FormSections[0].Subsections);
	let templateInfo = $state(data.assessmentTemplate);
	let answers = $state({});
	let errors = $state({});
	let formSubmissionId = data.submissionId;
	let questionResponseData = $derived(data.questionResponses);
	let submissionStatus = $derived(data.submissionStatus);
	let submittedOn = $state(data.submittedOn);
	let formattedSubmittedOn = $state('');
	let isSubmitted = $state(false);
	let sections = cleanAssessmentTemplate(section);

	const STORAGE_KEY = `Submission_${formSubmissionKey}`; // Make storage key unique for each submission link
	const SESSION_KEY = `sessionId_${formSubmissionKey}`; // Make session key unique as well
	const db = new IndexedDB<{ id: string; payload: any }>('form-submissions', 'unsaved_answers');

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

	$effect(() => {
		if (submissionStatus === 'Submitted') {
			isSubmitted = true;
		}
		console.log('Question response data is ', questionResponseData);
		answers = Object.fromEntries(
			(questionResponseData ?? []).map((item) => {
				const responseTypeKey = responseTypeMap[item.Question.ResponseType] || 'TextValue';
				console.log('Item is ', item);
				return [item.Question.id, item[responseTypeKey] ?? null];
			})
		);
	});

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

	onMount(() => {
		if (browser && !isSubmitted) {
			db.getAll().then((cachedData) => {
				const cached = cachedData.find((item) => item.id === STORAGE_KEY)?.payload?.answers;
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
						
						// Only update current form's answers if this is the current submission
						if (cachedSubmit.id === STORAGE_KEY) {
							answers = formData;
						}

						try {
							// Create question responses for this submission
							const schema = createSchema(sections);
							const validationResult = schema.safeParse(formData);

							if (!validationResult.success) {
								console.error('Validation failed for cached submission:', submissionToken);
								continue;
							}

							const questionResponses = await questionResponseModels(
								sections,
								formData,
								formSubmissionId,
								templateInfo.id,
								questionResponseData
							);

							console.log('Question responses created:', JSON.stringify(questionResponses, null, 2));

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
							console.log('Data saved:', saveData);

							// Now submit the form
							console.log('Submitting form with token:', submissionToken);
							const submitRes = await fetch('/api/server/submit', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									submissionKey: submissionToken,
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

	async function handleSave(e, showToast = true) {
		e.preventDefault();

		const schema = createSchema(sections);
		console.log('Schema:', schema);
		// console.log('Answers:', answers);
		const validationResult = schema.safeParse(answers);
		console.log('Validation result:', validationResult);

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
				sections,
				answers,
				formSubmissionId,
				templateInfo.id,
				questionResponseData
			);

			const res = await fetch('/api/server/question-response', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					questionResponses,
					formSubmissionKey,
					FormData: answers
				})
			});

			const saveData = await res.json();
			if (showToast) toastMessage(saveData);

			await db.add({ id: SESSION_KEY, payload: { sessionId: formSubmissionId } });
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
				const offlinePayload = {
					intentToSubmit: true,
					Token: formSubmissionKey,
					FormData: structuredCloneSafe(answers),
					submissionTimestamp
				};
				
				await db.add({
					id: STORAGE_KEY,
					payload: offlinePayload
				});
				await db.add({ id: SESSION_KEY, payload: { sessionId: formSubmissionId } });

				console.log('🔄 REGULAR FORM: Cached for offline submission');
				console.log('🔍 REGULAR FORM: Stored payload:', offlinePayload);
				console.log('🔍 REGULAR FORM: Storage key:', STORAGE_KEY);
				
				// Verify it was stored correctly
				const verification = await db.getAll();
				const storedItem = verification.find(item => item.id === STORAGE_KEY);
				console.log('🔍 REGULAR FORM: Verification - stored item:', storedItem);
				
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
					submissionKey: formSubmissionKey,
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

	async function syncAnswersToIndexedDB() {
		// Get existing data first to preserve important flags
		const existingData = await db.getAll();
		const currentSubmission = existingData.find((item) => item.id === STORAGE_KEY);
		
		// Preserve intentToSubmit and other submission-related data
		const preservedData = currentSubmission?.payload || {};
		
		// If submission is already marked for offline submission, don't overwrite it
		if (preservedData.intentToSubmit) {
			console.log('🔄 REGULAR FORM: Skipping sync - submission already marked for offline sync');
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

		console.log('🔄 REGULAR FORM: Answers synced with IndexedDB (preserving submission intent):', {
			preservedIntentToSubmit: preservedData.intentToSubmit,
			preservedToken: preservedData.Token,
			preservedTimestamp: preservedData.submissionTimestamp,
			storageKey: STORAGE_KEY,
			finalPayload: {
				...preservedData,
				FormData: structuredCloneSafe(answers)
			}
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

<div class="flex flex-row">
	<div class="mx-auto mt-20 flex h-screen w-[80%] rounded-sm p-1">
		<form onsubmit={handleSave} class="mx-auto w-[80%] space-y-3">
			<div>
				{#if isSubmitted}
					<Alert.Root variant="primary">
						<Icon icon="ooui:success" class="h-4 w-4" color="white" />
						<Alert.Description>This form has already been submitted!</Alert.Description>
					</Alert.Root>
				{/if}
			</div>

			<div class="relative mx-auto h-fit rounded-md border border-gray-500 pb-7 pt-5">
				{#if templateInfo}
					<div>
						<p class="absolute right-4 top-2 mr-0 mt-0 leading-7">{templateInfo.Type}</p>
						<div class="flex h-full flex-col justify-center text-center">
							<h2 class="mt-5 text-center text-3xl font-bold">{templateInfo.Title}</h2>
							<div class="mt-2 w-full items-center justify-center text-wrap">
								<p class="mx-auto">{templateInfo.Description}</p>
								<p class="ml-auto mr-4 text-end text-sm">Version: {templateInfo.CurrentVersion}</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<div class="min-h-[390px] rounded-md border border-gray-500">
				<QuestionPaper {sections} bind:answers bind:errors {isSubmitted} />
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
