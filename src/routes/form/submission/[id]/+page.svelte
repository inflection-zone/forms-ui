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

	const STORAGE_KEY = `Submission`;
	const SESSION_KEY = `sessionId`;
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
				const cachedSubmit = cachedData.find((item) => item.id === `${STORAGE_KEY}`)?.payload;

				if (cachedSubmit?.intentToSubmit) {
					console.log('Back online: auto-submitting cached submission...');
					const formData = cachedSubmit.FormData;
					answers = formData;

					const saveSuccess = await handleSave({ preventDefault: () => {} }, false);

					if (saveSuccess) {
						try {
							const res = await fetch('/api/server/submit', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									submissionKey: formSubmissionKey,
									FormData: formData
								})
							});

							const submissionData = await res.json();
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
									Token: formSubmissionKey,
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
				await db.add({
					id: STORAGE_KEY,
					payload: {
						intentToSubmit: true,
						Token: formSubmissionKey,
						FormData: structuredCloneSafe(answers),
						submissionTimestamp
					}
				});
				await db.add({ id: SESSION_KEY, payload: { sessionId: formSubmissionId } });

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
		await db.delete(STORAGE_KEY);
		await db.add({
			id: STORAGE_KEY,
			payload: {
				FormData: structuredCloneSafe(answers)
			}
		});

		// $inspect('Answers synced with IndexedDB:', answers);
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
