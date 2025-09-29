<script lang="ts">
	import { dropzone } from '$lib/components/common/dnd';
	import { Button } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Icon from '@iconify/svelte';
	import { formComponents } from './response.types/index';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { writable } from 'svelte/store';
	import Self from './Sections.svelte';
	////////////////////////////////////////////////////////////////////////////

	let {
		uiSections = $bindable(),
		highlightedSection,
		highlightedSubSection,
		deleteButtonClicked,
		deleteSubButtonClicked,
		openSheet,
		handleDeleteCard,
		handleDragAndDrop,
		openSectionForm,
		subSectionForm,
		closeSheet
	} = $props();

	// $inspect('uiSections', uiSections);

	let cardToDelete = $state('');

	//1 For handleing drag enter
	function handleDragEnter(sectionId: number) {
		highlightedSection = sectionId;
	}

	//2 For handleing drag leave
	function handleDragLeave(sectionId: number) {
		if (highlightedSection === sectionId) {
			highlightedSection = null;
			highlightedSubSection = null;
		}
	}

	//3 For handleing drag over
	function handleDragOver(sectionId: number, event: DragEvent) {
		event.preventDefault();
		highlightedSection = sectionId;
	}

	// For handleing drag enter of subsection
	function handleDragEnterSubsection(subSectionId: number) {
		highlightedSubSection = subSectionId;
	}

	// For handleing drag leave of subsection
	function handleDragLeaveSubsection(subSectionId: number) {
		if (highlightedSubSection === subSectionId) {
			highlightedSubSection = null;
			highlightedSection = null;
		}
	}

	// For handleing drag over of subsection
	function handleDragOverSubsection(subSectionId: number, event: DragEvent) {
		event.preventDefault();
		highlightedSubSection = subSectionId;
	}

	// For opening the delete modal
	function openDeleteModal(card: string) {
		deleteButtonClicked = true;
		cardToDelete = card;
	}

	// For closing the delete modal
	function closeDeleteModal() {
		deleteButtonClicked = false;
		cardToDelete = null;
	}

	// For confirming the deletion
	function confirmDeleteCard(cardId: string, type: string) {
		console.log(cardId);
		handleDeleteCard(cardId, type);
		closeDeleteModal();
	}

	// For closing subsection card delete model
	function closeDeleteSubModal() {
		deleteSubButtonClicked = false;
		cardToDelete = null;
	}

	const isOpen = writable<Record<number, boolean>>({});

	function toggleSection(sectionId: number) {
		isOpen.update((map) => ({
			...map,
			[sectionId]: !map[sectionId]
		}));
	}
</script>

{#each uiSections as section, index (section.id)}
	<div
		class="my-4 rounded-md border border-gray-300 px-4 py-4 shadow-lg dark:border-gray-800 {highlightedSection ===
		section.id
			? ' border-1 border-blue-600'
			: ''}"
		ondragenter={() => handleDragEnter(section.id)}
		ondragleave={() => handleDragLeave(section.id)}
		ondragover={(event) => handleDragOver(section.id, event)}
		use:dropzone={{
			on_dropzone: (data, e) => handleDragAndDrop(data, e, section.id)
		}}
		role="region"
		aria-label={`Section ${section.Title}`}
	>
		<Collapsible.Root class=" space-y-2">
			<div class="flex flex-row">
				<div class="flex items-center justify-between px-2">
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Collapsible.Trigger
									class={buttonVariants({ variant: 'ghost', size: 'sm', class: 'w-9 p-0' })}
									onclick={() => toggleSection(section.id)}
								>
									<Icon
										icon="grommet-icons:down"
										style="width: 12px; height: 12px;"
										class={`transition-transform duration-300 ${
											$isOpen[section.id] ? 'rotate-180' : 'rotate-0'
										}`}
									/>
									<span class="sr-only">Toggle</span>
								</Collapsible.Trigger>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>Collaps to see</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>

				<div class="flex h-full flex-row md:w-full">
					<Button
						variant="outline"
						class=" h-full flex-col p-2  md:w-full"
						onclick={() => openSectionForm(section)}
					>
						<div class="flex-col">
							{#if section.Title}
								<p>{section.Title}</p>
							{:else}
								<p>{`Section ${index + 1}`}</p>
							{/if}
							<p class=" whitespace-normal text-sm font-normal text-gray-400 dark:text-gray-500">
								Drop the Subsection and response type cards here
							</p>
						</div>
					</Button>

					<AlertDialog.Root>
						<AlertDialog.Trigger class="{buttonVariants({ variant: 'ghost' })} ml-1 h-full w-full bg-red400">
							<Icon icon="weui:delete-outlined" width="20" height="20" style="color:red" />
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
								<AlertDialog.Description>
									This action cannot be undone. This will permanently delete your Section and remove
									your data from our servers. please be certain.
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action
									class="bg-destructive hover:bg-destructive dark:text-white"
									onclick={() => confirmDeleteCard(section.id, 'Section')}
									>Delete</AlertDialog.Action
								>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</div>
			</div>
			<Collapsible.Content class="space-y-2">
				<div class="h-fit w-full p-1" role="list" aria-label={`Cards in section: ${section.Title}`}>
					{#if section.FormFields.length === 0}
						<p class="text-center text-sm text-slate-500">Drop response type cards here</p>
					{/if}

					{#each section.FormFields as card, index (card.id)}
						<div
							class="hover-container mx-6 items-center justify-between"
							draggable="true"
							ondragover={(event) => {
								event.preventDefault();
							}}
							role="listitem"
							aria-label={`Card: ${card.Title}`}
						>
							<div class="relative my-4 flex rounded-md border">
								{#if card.ResponseType !== 'None'}
									{@const Component = formComponents[card.ResponseType]}
									{#if Component}
										<Component {card} {openSheet} />
									{/if}
								{/if}
								<button
									class="delete-button px-2"
									onclick={() => openDeleteModal(card.id)}
									aria-label="Delete card"
								>
									<Icon icon="weui:delete-outlined" width="18" height="18" style="color: red " />
								</button>
							</div>
						</div>
					{/each}

					{#if deleteButtonClicked}
						<div class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"></div>

						<div class="fixed inset-0 z-50 flex items-center justify-center">
							<div
								class="relative z-50 w-full max-w-lg border bg-background p-6 shadow-lg sm:rounded-lg md:w-full"
							>
								<div class="flex flex-col space-y-2 text-center sm:text-left">
									<h1 class="text-lg font-semibold">Are you absolutely sure?</h1>
									<p class="text-sm text-muted-foreground">
										This action cannot be undone. This will permanently delete your question and
										remove your data from our servers.
									</p>
								</div>

								<div class="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
									<Button variant="outline" onclick={closeDeleteModal}>Cancel</Button>
									<Button
										class="bg-destructive hover:bg-destructive dark:text-white"
										onclick={() => confirmDeleteCard(cardToDelete, 'Card')}
									>
										Delete
									</Button>
								</div>
							</div>
						</div>
					{/if}
				</div>

				{#if section.Subsections.length > 0}
					<Self
						bind:uiSections={section.Subsections}
						{handleDragAndDrop}
						{highlightedSection}
						{highlightedSubSection}
						{deleteButtonClicked}
						{deleteSubButtonClicked}
						{openSheet}
						{subSectionForm}
						{handleDeleteCard}
						{openSectionForm}
						{closeSheet}
					/>
				{/if}
			</Collapsible.Content>
		</Collapsible.Root>
	</div>
{/each}

<style>
	.delete-button {
		@apply absolute -right-7 top-[40%] hidden p-1 text-white;
	}

	.hover-container:hover .delete-button {
		@apply block;
	}

	:global(.dialog-content.dialog-content) {
		scrollbar-width: none;
		-ms-overflow-style: none;
		overflow-y: scroll;
	}

	:global(.dialog-content.dialog-content::-webkit-scrollbar) {
		width: 0;
		height: 0;
		display: none;
	}
</style>
