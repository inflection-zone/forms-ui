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
	const STORAGE_KEY = `Submission`;
	const SESSION_KEY = `sessionId`;
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
				submissionId || id, // Use submissionId if provided, otherwise fall back to id
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
					formSubmissionKey: encryptedKey || id, // Use encrypted key if available, otherwise fall back to original URL parameter
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
				await db.add({
					id: STORAGE_KEY,
					payload: {
						intentToSubmit: true,
						Token: id, // Use the original URL parameter instead of templateId
						FormData: structuredCloneSafe(answers),
						submissionTimestamp
					}
				});
				await db.add({ id: SESSION_KEY, payload: { sessionId: code } });

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
					submissionKey: id, // Use the original URL parameter instead of templateId
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
				const cachedSubmit = cachedData.find((item) => item.id === `${STORAGE_KEY}`)?.payload;

				if (cachedSubmit?.intentToSubmit) {
					console.log('Back online: auto-submitting cached submission...');
					
					const formData = cachedSubmit.FormData;
					answers = formData;

					// Ensure templateInfo is loaded before proceeding
					if (!templateInfo || !Array.isArray(templateInfo) || templateInfo.length === 0) {
						console.log('Template not loaded yet, waiting...');
						// Wait a bit and try again
						setTimeout(() => {
							syncOfflineData();
						}, 1000);
						return;
					}

					// First create a submission for offline forms
					let submissionId = null;
					let encryptedKey = null;
					try {
						const createSubmissionRes = await fetch('/api/server/submission', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								FormTemplateId: templateId
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
							message: 'Failed to create submission. Please try again.',
							type: 'error',
							timeout: 3000
						});
						return;
					}

					// Now save the question responses with the proper submission ID
					const saveSuccess = await handleSave({ preventDefault: () => {} }, false, submissionId, encryptedKey);

					if (saveSuccess) {
						try {
							console.log('Submitting form with encrypted key:', encryptedKey);
							console.log('Submit request body:', JSON.stringify({
								submissionKey: encryptedKey,
								FormData: formData
							}, null, 2));

							const res = await fetch('/api/server/submit', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									submissionKey: encryptedKey, // Use the encrypted key, not submission ID
									FormData: formData
								})
							});

							console.log('Submit response status:', res.status);
							const submissionData = await res.json();
							console.log('Submit response data:', submissionData);
							toastMessage(submissionData);

							if (!submissionData?.message) {
								addToast({
									message: 'Submission successful after reconnecting.',
									type: 'success',
									timeout: 3000
								});
								await db.delete(STORAGE_KEY);
								console.log('IndexedDB cleared after sync.');
							}
						} catch (err) {
							console.error('Network lost during sync:', err);
							await db.add({
								id: STORAGE_KEY,
								payload: {
									intentToSubmit: true,
									Token: id, // Use the original URL parameter instead of templateId
									FormData: formData
								}
							});
							addToast({
								message: 'Network lost again during sync. Unsynced data retained.',
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

			window.addEventListener('online', syncOfflineData);
			return () => {
				window.removeEventListener('online', syncOfflineData);
			};
		}
	});

	async function syncAnswersToIndexedDB() {
		await db.delete(STORAGE_KEY);
		await db.add({
			id: STORAGE_KEY,
			payload: {
				FormData: structuredCloneSafe(answers)
			}
		});

		console.log('Answers synced with IndexedDB:', answers);
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
