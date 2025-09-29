<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label';
	import { questionSchema } from '../../question-schema';
	import type { QuestionUpdateModel } from '../../../common/questionTypes';
	import ValidationLogicIntegration from '$lib/components/validation-logic/ValidationLogicIntegration.svelte';
	import SkipLogicIntegration from '$lib/components/skip-logic/SkipLogicIntegration.svelte';
	import CalculationLogicIntegration from '$lib/components/calculation-logic/CalculationLogicIntegration.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { ImageUploadModel } from '../../file-upload/file-upload-model';
	import { imageUploadSchema } from '../../file-upload/file-upload-schema';

	//////////////////////////////////////////////////////////////////////////////

	let {
		questionCard = $bindable(),
		errors = $bindable(),
		handleQuestionCardUpdate,
		questionList
	} = $props();
	let imageUrl = $state(questionCard.QuestionImageUrl)
	let imageResourceId = $state(questionCard.ImageResourceId)

	const onFileSelected = async (e) => {
		const input = e.target as HTMLInputElement;
    	const file = input.files?.[0];

		const fileCreateModel: ImageUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = imageUploadSchema.safeParse(fileCreateModel);
		console.log('validation result of file', fileValidationResult);

		if (!fileValidationResult.success) {
			errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		const formData = new FormData();
		formData.append('file', file);
		formData.append('filename', file.name);

		try {
			const res = await fetch(`/api/server/file-upload/upload`, {
				method: 'POST',
				body: formData
			});

			const response = await res.json();
			imageUrl = response.Data.FileResources[0].Url;
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				const imageResourceId_ = response.Data.FileResources[0].id;
				console.log('ImageResource', imageResourceId_);
				if (imageResourceId_) {
					imageResourceId = imageResourceId_;
					return true;
				}
				console.log('imageResourceId', imageResourceId);

				toastMessage(response);
				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.error('Error uploading file:', error);

			toastMessage();
		}
	};

	async function handleSubmit(event) {
		event.preventDefault();
		console.log(questionCard.Title);

		const model: QuestionUpdateModel = {
			id: questionCard.id,
			Title: questionCard.Title,
			Description: questionCard.Description,
			ResponseType: questionCard.ResponseType,
			Score: questionCard.Score,
			CorrectAnswer: questionCard.CorrectAnswer,
			Hint: questionCard.Hint,
			ImageResourceId: imageResourceId,
			IsRequired: questionCard.IsRequired
		};

		const result = await questionSchema.safeParseAsync(model);
		if (!result.success) {
			console.log('client side validation error', result.error.flatten().fieldErrors);
			errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
		}

		if (Object.keys(errors).length === 0 || result?.success) {
			console.log('Called handleQuestionCardUpdate');
			handleQuestionCardUpdate(model);
		}
	}
</script>

<Card.Root class="rounded-none border-none  p-4 ">
	<form
		class="flex h-[calc(100vh-2rem)] flex-col"
		onsubmit={(event) => {
			event.preventDefault();
			handleSubmit(event);
		}}
	>
		<!-- Scrollable Content Area -->
		<div class="flex-1 overflow-y-auto px-2 pb-4">
			<div class="relative my-2 hidden grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Id</Label>
			</div>
			<Input bind:value={questionCard.id} class="hidden" />

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Title<span class="text-red-600">*</span></Label>
			</div>
			<Input bind:value={questionCard.Title} />
			<p class="text-destructive">{errors?.Title}</p>

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Description</Label>
			</div>
			<Input bind:value={questionCard.Description} />
			<p class="text-destructive">{errors?.Description}</p>

			<div class="relative my-4 grid grid-cols-12 items-center gap-4">
				<div class="col-span-11 flex items-center space-x-2">
					<Label for="isRequired">Required</Label>
					<input
						id="isRequired"
						type="checkbox"
						bind:checked={questionCard.IsRequired}
						aria-labelledby="isRequired"
						class="h-4 w-4"
					/>
				</div>
			</div>
			<p class="text-destructive">{errors?.IsRequired}</p>

			<div class="relative my-2 hidden grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Response Type</Label>
			</div>
			<Input bind:value={questionCard.ResponseType} class="hidden" />

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Score</Label>
			</div>
			<Input bind:value={questionCard.Score} type="number" />
			<p class="text-destructive">{errors?.Score}</p>

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Correct Answer</Label>
			</div>
			<Input bind:value={questionCard.CorrectAnswer} />
			<p class="text-destructive">{errors?.CorrectAnswer}</p>

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Hint</Label>
			</div>
			<Input bind:value={questionCard.Hint} />
			<p class="text-destructive">{errors?.Hint}</p>

			<div class="relative my-2 grid grid-cols-12 items-center gap-4">
				<Label class="col-span-11 ">Question Image Url</Label>
			</div>
			
			<Input name="file" type="file" bind:value={questionCard.ImageResourceId} onchange={async (e) => await onFileSelected(e)} />
			<p class="text-destructive">{errors?.ImageResourceId}</p>

			<!-- VALIDATION LOGIC INTEGRATION -->
			<ValidationLogicIntegration bind:questionCard {questionList} />

			<!-- SKIP LOGIC INTEGRATION -->
			<SkipLogicIntegration bind:questionCard {questionList} />

			<!-- CALCULATION LOGIC INTEGRATION -->
			<CalculationLogicIntegration bind:questionCard {questionList} />
		</div>

		<!-- Fixed Bottom Button -->
		<div class="sticky bottom-0 z-10 mt-4 border-t border-gray-200 py-4">
			<Button class="w-full" type="submit">
				<Icon icon="lucide:check" class="mr-2 h-4 w-4" />
				Update Question Card
			</Button>
		</div>
	</form>
</Card.Root>
