<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import { 
		SectionEditorForm, 
		Sidebar, 
		FormHelper
	} from '$lib/index';
	import FieldLibrarySidebar from '$lib/components/common/FieldLibrarySidebar.svelte';
	import { healthCarePlugins, basicCards } from '$lib/components/common/questionTypes';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Sections from './components/Sections.svelte';
	import { dropzone } from '$lib/components/common/dnd';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/components/toast/toast.store';
	import Icon from '@iconify/svelte';

	////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let errors: Record<string, string> = $state({});

	let typeOfQuestion: 'Basic' | 'HealthCare' | 'FieldLibrary' = $state('Basic');
	let uiSections = $state(data.templateInfo.FormSections[0].Subsections);
	const userId = $derived(page.params.userId);
	const parentFormTemplateId = $derived(page.params.templateId);
	const rootSectionId = data.templateInfo.FormSections[0].id;

	let showSheet = $state(false); // false;
	let questionCard = $state();
	let highlightedSection: number | null = $state();
	let highlightedSubSection: number | null = $state();
	let deleteButtonClicked = $state(false);
	let deleteSubButtonClicked = $state(false);
	let sectionForm = $state(false);
	let subSectionForm = $state(false);

	let cardToOpen = $state();
	let sectionToOpen = $state();

	$effect(() => {
		uiSections = data.templateInfo.FormSections[0].Subsections;
	});

	function changeTypes(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.value === 'Basic' || target.value === 'HealthCare' || target.value === 'FieldLibrary') {
			typeOfQuestion = target.value as 'Basic' | 'HealthCare' | 'FieldLibrary';
		}
	}

	function openSheet(card) {
		showSheet = true;
		cardToOpen = card;
	}

	const handleDragAndDrop = async (dropData, event, sectionId = null, subsectionId = null) => {
		event.preventDefault();
		event.stopPropagation();

		console.log('dropData: ', dropData);
		console.log('sectionId: ', sectionId);
		console.log('subsectionId: ', subsectionId);
		console.log('parentFormTemplateId: ', parentFormTemplateId);
		if (sectionId === null && subsectionId === null) {
			// To create section in root section
			// Required data: parentFormTemplateId, parentSectionId that is rootSectionId
			if (dropData.type === 'section') {
				const response = await fetch(`/api/server/section`, {
					method: 'POST',
					body: JSON.stringify({
						parentFormTemplateId,
						parentSectionId: rootSectionId
					}),
					headers: { 'content-type': 'application/json' }
				});
				const sectionData = await response.json();
				toastMessage(sectionData);
				console.log('sectionData: ', sectionData);
			}
		}

		if (sectionId !== null && subsectionId === null) {
			if (dropData.type === 'card') {
				const model = {
					parentFormTemplateId,
					parentSectionId: sectionId,
					responseType: dropData.value
				};
				const response = await fetch(`/api/server/form-fields`, {
					method: 'POST',
					body: JSON.stringify(model),
					headers: { 'content-type': 'application/json' }
				});
				const questionData = await response.json();
				toastMessage(questionData);
				console.log('questionData: ***', questionData);
			}

			if (dropData.type === 'section') {
				const response = await fetch(`/api/server/section`, {
					method: 'POST',
					body: JSON.stringify({
						parentFormTemplateId,
						parentSectionId: sectionId
					}),
					headers: { 'content-type': 'application/json' }
				});
				const sectionData = await response.json();
				toastMessage(sectionData);
				console.log('SubsectionData: ', sectionData);
			}
		}

		if (sectionId !== null && subsectionId !== null) {
			if (dropData.type === 'card') {
				const model = {
					parentFormTemplateId,
					parentSectionId: subsectionId,
					responseType: dropData.value
				};
				const response = await fetch(`/api/server/form-fields`, {
					method: 'POST',
					body: JSON.stringify(model),
					headers: { 'content-type': 'application/json' }
				});
				const questionData = await response.json();
				toastMessage(questionData);
				console.log('questionData: ', questionData);
			}
		}
		await invalidate('app:allNodes');
	};

	const toastMessage = (response = null) => {
		if (!response) {
			addToast({
				message: 'Something went wrong',
				type: 'error',
				timeout: 3000
			});
			return;
		}

		response?.HttpCode === 201 || response?.HttpCode === 200
			? addToast({
					message: response?.Message,
					type: 'success',
					timeout: 3000
				})
			: addToast({
					message: response?.Message,
					type: 'error',
					timeout: 3000
				});
	};

	function closeSheet(event?: any) {
		showSheet = false;
		errors = {};
		invalidateAll();
	}

	function closeModel(type: string, response: any) {
		if (type === 'Section') {
			console.log(response);

			toastMessage(response);

			if (response.HttpCode === 200) {
				sectionForm = false;
			}
		}
		if (type === 'Card') {
			toastMessage(response);
			if (response.HttpCode === 200) {
				showSheet = false;
			}
			// errors = {};
		}
	}

	// function handleSubmitForm(event: { preventDefault: () => void }) {
	// 	event.preventDefault();
	// 	closeSheet(event);
	// }

	async function handleDeleteCard(id: string, type: 'Section' | 'Card') {
		switch (type) {
			case 'Section':
				try {
					const response = await fetch(`/api/server/section/${id}`, {
						method: 'DELETE'
					});

					const res = await response.json();
					// console.log('res: ', res);
					toastMessage(res);
					invalidate('app:allNodes');
				} catch (error) {
					console.error('Error deleting section:', error);
					toastMessage();
					invalidate('app:allNodes');
				}
				break;

			case 'Card':
				try {
					const response = await fetch(`/api/server/form-fields/${id}`, {
						method: 'DELETE'
					});
					const res = await response.json();
					// console.log('res: ', res);
					toastMessage(res);
					invalidate('app:allNodes');
				} catch (error) {
					console.error('Error deleting card:', error);
					toastMessage();
					invalidate('app:allNodes');
				}
				break;

			default:
				toastMessage();
				break;
		}
	}

	async function openSectionForm(section) {
		sectionToOpen = section;
		sectionForm = true;
	}

	function closeSectionForm() {
		sectionForm = false;
		errors = {};
		invalidateAll();
	}

	function closeSubSectionForm() {
		subSectionForm = false;
	}

	async function handleQuestionCardUpdate(model) {
		const response = await fetch(`/api/server/form-fields`, {
			method: 'PUT',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
		const question = await response.json();
		// console.log(question);
		if (question.HttpCode === 200) {
			closeModel('Card', question);
			errors = {};
			invalidateAll();
			return;
		}

		errors = question?.Errors || {};
		if (Object.keys(errors).length === 0) {
			toastMessage(question);
		}
		invalidateAll();
	}

	async function handleSectionUpdate(model) {
		console.log(model,"I am from handleSectionUpdate");
		const response = await fetch(`/api/server/section`, {
			method: 'PUT',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
		const section = await response.json();
		// console.log(section);
		if (section.HttpCode === 200) {
			closeModel('Section', section);
			errors = {};
			invalidateAll();
			return;
		}

		errors = section?.Errors || {};
		if (Object.keys(errors).length === 0) {
			toastMessage(section);
		}
		invalidateAll();
	}

	let isOpen = $state(false);
	function toggleOpen() {
		isOpen = !isOpen;
	}
</script>

{#if sectionForm}
    <div
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
		<SectionEditorForm
			bind:errors
			{handleSectionUpdate}
			{closeSectionForm}
			sectionData={sectionToOpen}
		/>
	</div>
{/if}
{#if showSheet}
	<FormHelper {closeSheet} {handleQuestionCardUpdate} bind:questionCard={cardToOpen} bind:errors bind:questionList={uiSections}/>
{/if}


<!-- Section -->

<div class="bg-green-5 my-10 flex min-h-screen flex-row">
	<div class="md:w-[25%] bg-gray-100 md:bg-white border border-white">
		<button onclick={toggleOpen} class=" m-2 md:hidden">
			<Icon
				icon={isOpen ? 'ant-design:close-outlined' : 'material-symbols:menu-rounded'}
				class=" text-2xl"
			/>
		</button>

		<FieldLibrarySidebar {typeOfQuestion} {changeTypes} {isOpen} />
	</div>
	<div class="flex md:w-[70%] overflow-hidden">
        <div class="my-1 w-full space-y-2 p-2 md:mx-24 lg:mx-10">
            <div class="flex w-full flex-row items-center justify-between">
                <Breadcrumb.Root>
                    <Breadcrumb.List class="flex">
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="/users/{userId}/form-templates">Templates</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Page>Question</Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
                
                <!-- <div class="ml-auto flex items-center">
                    <Dialog.Root>
                        <Dialog.Trigger class="{buttonVariants({ variant: 'outline' })} flex"></Dialog.Trigger>
                        <Dialog.Content class="dialog-content h-[90vh] overflow-y-auto sm:max-w-[150vh]">
                            <p>assa</p>
                        </Dialog.Content>
                    </Dialog.Root>
                </div> -->
            </div>
            <div class="h-full w-full overflow-hidden">
                {#if uiSections.length === 0}
                    <p class="text-center text-sm text-slate-500">
                        Drag and drop sections, subsections, and question response type cards here
                    </p>
                {/if}
                <div
                    ondragover={(event) => {
                        event.preventDefault();
                    }}
                    class="flex h-full flex-col"
                    use:dropzone={{ on_dropzone: handleDragAndDrop }}
                    role="region"
                    aria-label="Drop Area"
                >
                    <Sections
                        bind:uiSections
                        {handleDragAndDrop}
                        {highlightedSection}
                        {highlightedSubSection}
                        {deleteButtonClicked}
                        {deleteSubButtonClicked}
                        {openSectionForm}
                        {subSectionForm}
                        {handleDeleteCard}
                        {closeSheet}
                        {openSheet}
                    />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
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
