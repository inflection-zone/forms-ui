<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '../ui/label';
	import * as Select from '$lib/components/ui/select/index.js';

	///////////////////////////////////////////////////////////////
	let { templateData, errors = $bindable() } = $props();

	// $inspect(templateData, 'ghcfszdgvbjkn');
	// async function handleSubmit(event) {
	// 	event.preventDefault();

	// 	const model = {
	// 		id: sectionData.id,
	// 		ParentSectionId: sectionData.ParentSectionId,
	// 		Title: sectionData.Title,
	// 		Description: sectionData.Description,
	// 		SectionIdentifier: sectionData.SectionIdentifier
	// 	};

	// 	console.log(model);

	// 	const result = await sectionSchema.safeParseAsync(model);
	// 	if (!result.success) {
	// 		console.log('client side validation error', result.error.flatten().fieldErrors);
	// 		errors = Object.fromEntries(
	// 			Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
	// 				key,
	// 				val?.[0] || ''
	// 			])
	// 		);
	// 	}

	// 	if (Object.keys(errors).length === 0 || result?.success) {
	// 		handleSectionUpdate(model);
	// 	}
	// }

	const types = [
		{ value: 'Survey', label: 'Survey' },
		{ value: 'Questionnaire', label: 'Questionnaire' },
		{ value: 'TestPaper', label: 'Test Paper' },
		{ value: 'DataCollection', label: 'Data Collection' }
	];

	let typeValue = $state(templateData.Type);
	const selectedTypeValue = $derived(
		types.find((f) => f.value === typeValue)?.label ?? 'Select a Type of Template'
	);

	const itemsPerPage = [
		{ value: 'AllQuestions', label: 'All Questions' },
		{ value: 'OneQuestion', label: 'One Question' },
		{ value: 'OneSection', label: 'OneSection' }
	];

	let itemsPerPageValue = $state(templateData.ItemsPerPage);
	const selectedItemsPerPage = $derived(
		itemsPerPage.find((f) => f.value === itemsPerPageValue)?.label ?? 'Select items per page'
	);
</script>

<div class=" space-y-2 grid">
	<div class="relative hidden items-center gap-4">
		<Label class="col-span-11 ">Id<span class="text-red-600">*</span></Label>
		<Input name="id" bind:value={templateData.id} class="hidden" />
	</div>

	<div class="relative items-center space-y-1">
		<Label class="col-span-11 ">Title<span class="mx-1 text-red-600">*</span></Label>
		<Input name="Title" bind:value={templateData.Title} />
		<p class="text-destructive">{errors?.Title}</p>
	</div>

	<div class="relative items-center  space-y-1">
		<Label class="col-span-11 ">Description</Label>
		<Input name="Description" bind:value={templateData.Description} />
		<p class="text-destructive">{errors?.Description}</p>
	</div>

	<!-- <div class="relative items-center  space-y-1">
		<Label class="col-span-11 ">Tenant Code</Label>
		<Input name="TenantCode" bind:value={templateData.TenantCode} />
		<p class="text-destructive">{errors?.TenantCode}</p>
	</div> -->

	<div class="relative items-center  space-y-1">
		<Label class="col-span-11 ">Current Version</Label>
		<Input name="CurrentVersion" bind:value={templateData.CurrentVersion} type = "number" />
	</div>

	<div class=" space-y-1">
		<Label class="" for="ItemsPerPage">Select Type <span class="text-red-600">*</span></Label>
		<Select.Root type="single" name="Type" bind:value={typeValue}>
			<Select.Trigger class="focus:ring-0 focus:ring-offset-0 focus:border-primary">
				{selectedTypeValue}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.GroupHeading>Types</Select.GroupHeading>
					{#each types as type (type.value)}
						<Select.Item value={type.value} label={type.label} />
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	<div class=" space-y-1">
		<Label class=" " for="ItemsPerPage"
			>Select Items per page <span class="text-red-600">*</span></Label
		>
		<Select.Root type="single"  name="ItemsPerPage" bind:value={itemsPerPageValue}>
			<Select.Trigger class="focus:ring-0 focus:ring-offset-0 focus:border-primary">
				{selectedItemsPerPage}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.GroupHeading>Types</Select.GroupHeading>
					{#each itemsPerPage as items (items.value)}
						<Select.Item value={items.value} label={items.label} />
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>
</div>
