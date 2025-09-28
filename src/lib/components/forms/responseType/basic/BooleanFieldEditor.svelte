<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label';
	import Icon from '@iconify/svelte';
	import type { QuestionUpdateModel } from '../../../common/questionTypes';
	import { questionSchema } from '../../question-schema';
	import ValidationLogicIntegration from '$lib/components/validation-logic/ValidationLogicIntegration.svelte';
	import SkipLogicIntegration from '$lib/components/skip-logic/SkipLogicIntegration.svelte';
	import CalculationLogicIntegration from '$lib/components/calculation-logic/CalculationLogicIntegration.svelte';

	//////////////////////////////////////////////////////////////////////////////

	let {
		questionCard = $bindable(),
		errors = $bindable(),
		handleQuestionCardUpdate,
		questionList = $bindable()
	} = $props();

	let options = $state(questionCard.Options ? [...questionCard.Options] : []);

	async function handleSubmit(event) {
		event.preventDefault();

		const updatedOptions = options.map((option, index) => ({
			Text: option.Text,
			Sequence: option.Sequence || index + 1,
			ImageUrl: option.ImageUrl
		}));

		const model: QuestionUpdateModel = {
			id: questionCard.id,
			Title: questionCard.Title,
			Description: questionCard.Description,
			ResponseType: questionCard.ResponseType,
			Score: questionCard.Score,
			CorrectAnswer: questionCard.CorrectAnswer,
			Hint: questionCard.Hint,
			QuestionImageUrl: questionCard.QuestionImageUrl,
			Options: updatedOptions,
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

	const hardcodedImageUrl = 'https://example.com/default';

	function addOption() {
		if (questionCard.ResponseType === 'Boolean' && options.length >= 2) return;

		// Add a new option
		options = [
			...options,
			{ Sequence: (options.length + 1).toString(), Text: '', ImageUrl: hardcodedImageUrl }
		];
	}

	function updateOption(index, key, value) {
		// Update the option at the specified index
		options[index] = { ...options[index], [key]: value };
		// Trigger reactivity by reassigning the array
		options = [...options];
	}

	function removeOption(index) {
		// Remove the option at the specified index
		options = options.filter((_, i) => i !== index);
	}
</script>

<Card.Root class="rounded-none border-none p-4">
	<form
		class="custom-scrollbar h-[calc(screen-2rem)] min-h-screen w-full overflow-y-hidden px-2"
		onsubmit={(event) => {
			event.preventDefault();
			handleSubmit(event);
		}}
	>
		<Input bind:value={questionCard.id} class="hidden" />

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Title<span class="text-red-600">*</span></Label>
		</div>
		<Input bind:value={questionCard.Title} />
		<p class="error">{errors?.Title}</p>

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Description</Label>
		</div>
		<Input bind:value={questionCard.Description} />

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
		<p class="error">{errors?.IsRequired}</p>

		{#if !questionCard.IsFieldLibraryField}
			<div class="my-2 flex flex-col">
				<Label>Options <span class="text-red-600">*</span></Label>
				<Button
					type="button"
					onclick={addOption}
					class="my-2 w-fit"
					disabled={questionCard.ResponseType === 'Boolean' && options.length >= 2}
				>
					Add Option
				</Button>

				{#each options as option, index}
					<div class="mb-2 flex items-center">
						<Input
							type="number"
							name={`options[${index}].Sequence`}
							bind:value={option.Sequence}
							oninput={(e) => updateOption(index, 'Sequence', e.target.value)}
							placeholder={`Sequence of ${index + 1} Option`}
							class="mr-2 w-1/4"
						/>
						<Input
							type="text"
							name={`options[${index}].Text`}
							bind:value={option.Text}
							oninput={(e) => updateOption(index, 'Text', e.target.value)}
							placeholder={`Data for Option ${index + 1}`}
							class="mr-2 w-full"
						/>
						<Input type="hidden" name={`options[${index}].ImageUrl`} bind:value={option.ImageUrl} />
						<Button type="button" onclick={() => removeOption(index)} class="ml-2">
							<Icon icon="mingcute:delete-2-line" width="25" height="25" />
						</Button>
					</div>
				{/each}

				<input type="hidden" name="options" value={JSON.stringify(options)} />
			</div>
		{:else}
			<div class="my-2 flex flex-col">
				<Label>Options (Pre-configured from Field Library)</Label>
				<div class="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
					This field uses pre-configured options from the Field Library. Options cannot be modified here.
				</div>
			</div>
		{/if}

		<div class="relative my-2 hidden grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Response Type</Label>
		</div>
		<Input bind:value={questionCard.ResponseType} class="hidden" />

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Question Score</Label>
		</div>
		<Input bind:value={questionCard.Score} type="number" />
		<p class="error">{errors?.Score}</p>

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Hint</Label>
		</div>
		<Input bind:value={questionCard.Hint} />
		<p class="error">{errors?.Hint}</p>

		<div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Correct Answer</Label>
		</div>
		<Input bind:value={questionCard.CorrectAnswer} />
		<p class="text-destructive">{errors?.CorrectAnswer}</p>

		<!-- <div class="relative my-2 grid grid-cols-12 items-center gap-4">
			<Label class="col-span-11 ">Question Image Url</Label>
		</div>
		<Input bind:value={questionCard.QuestionImageUrl} />
		<p class="error">{errors?.QuestionImageUrl}</p> -->

		<!-- VALIDATION LOGIC INTEGRATION -->
		<ValidationLogicIntegration bind:questionCard  {questionList} />

		<!-- SKIP LOGIC INTEGRATION -->
		<SkipLogicIntegration {questionCard} {questionList} />

		<!-- CALCULATION LOGIC INTEGRATION -->
		<CalculationLogicIntegration {questionCard} {questionList} />

		<div class="sticky bottom-0 z-10 mt-4 border-t border-gray-200 py-4">
			<Button class="w-full" type="submit">
				<Icon icon="lucide:check" class="mr-2 h-4 w-4" />
				Save changes
			</Button>
		</div>
	</form>
</Card.Root>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 2px;
		height: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #d70c0c;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #888;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
