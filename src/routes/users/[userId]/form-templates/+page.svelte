<script lang="ts">
	import type { ActionData, PageServerData } from './$types';
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';
	import { TemplateTable, TemplateForm } from '$lib/components/template/index';
	import { enhance } from '$app/forms';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { invalidateAll } from '$app/navigation';
	
	//////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const userId = page.params.userId;

	let errors = $state({});
	let templateData = {};
	let expandedItem: string | null = $state();
	let selectedSubmenu: string | null = $state('createForm');
	let showAddModal = $state(false);

	// console.log("This is form data", form,"And this is errors", errors);
	$inspect(errors);
	type SubMenuItem = {
		name: string;
		icon: string;
		action: () => void;
	};

	type MenuItem = {
		name: string;
		icon: string;
		subMenuItems: SubMenuItem[];
	};

	const menuItems: MenuItem[] = [
		{
			name: 'Forms',
			icon: 'fluent-mdl2:file-template',
			subMenuItems: [
				// {
				// 	name: 'Create New Form',
				// 	icon: 'mdi:form-textbox',
				// 	action: () => selectSubmenu('createForm')
				// },
				// { name: 'View Forms', icon: 'mdi-light:eye', action: () => selectSubmenu('viewForms') }
			]
		}
	];

	function toggleExpand(itemName: string) {
		expandedItem = expandedItem === itemName ? null : itemName;
	}

	function selectSubmenu(submenu: string) {
		selectedSubmenu = submenu;
	}

	function openAddModal() {
		showAddModal = true;
	}

	function closeAddModal() {
		showAddModal = false;
	}

	// Button class helper
	function getButtonClasses(variant: 'default' | 'ghost' | 'outline' = 'default', size: 'sm' | 'md' | 'lg' = 'md') {
		const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
		
		const variants = {
			default: 'bg-primary text-primary-foreground hover:bg-primary/90',
			ghost: 'hover:bg-accent hover:text-accent-foreground',
			outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
		};

		const sizes = {
			sm: 'h-9 px-3 text-sm',
			md: 'h-10 py-2 px-4',
			lg: 'h-11 px-8'
		};

		return `${baseClasses} ${variants[variant]} ${sizes[size]}`;
	}

async function handleTemplateUpdate(model) {
		console.log(model,"I am from handleSectionUpdate");
		const response = await fetch(`/api/server/template`, {
			method: 'PUT',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
		const section = await response.json();
		console.log(section);
		if (section.HttpCode === 200) {
			toastMessage(section);
			// closeModel('Section', section);
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
</script>

<div class="relative my-10 flex h-screen w-full flex-col md:flex-row">
	<!-- Sidebar -->
	<div class="flex h-auto w-full flex-col justify-between border-r  p-4 md:h-full md:w-1/4">
		<div class="flex flex-col space-y-2">
			{#each menuItems as item}
				<div>
					<div class="group relative">
						<button
							class="{getButtonClasses('outline')} w-full justify-start space-x-2 px-5 py-3 text-sm duration-500 md:text-base"
							onclick={() => toggleExpand(item.name)}
						>
							<Icon icon={item.icon} width="20" height="20" class="text-primary md:h-6 md:w-6" />
							<p>{item.name}</p>
						</button>
					</div>

					{#if expandedItem === item.name}
						<div class=" mt-2 flex flex-col space-y-2">
							{#each item.subMenuItems as subItem}
								<button
									class="{getButtonClasses('ghost')} flex justify-start text-sm md:text-base"
									onclick={subItem.action}
								>
									<Icon
										icon={subItem.icon}
										width="16"
										height="16"
										class="text-primary md:h-5 md:w-5"
									/>
									<p class=" text-left">{subItem.name}</p>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Main Content -->
	<div class="h-full w-full overflow-auto md:p-6">
		{#if selectedSubmenu === 'createForm'}
			<div class="container mx-auto">
				<div class=" flex flex-col md:flex-row md:items-center">
					<div>
						<h2 class="my-2 text-lg font-bold tracking-tight md:text-2xl">Welcome...!</h2>
						<p class="my-2 text-sm text-muted-foreground md:text-base">
							Here's a Form Templates !
						</p>
					</div>
				<!-- <AssessmentForm {data} /> -->
				<button 
					class="{getButtonClasses('default')} my-2 w-28 md:ml-auto"
					onclick={openAddModal}
				>
					Add New
				</button>
				</div>
				<!-- <DataTable data={assessments.Items} {columns} /> -->
				<TemplateTable {data} bind:errors {handleTemplateUpdate}/>
			</div>
		{:else if selectedSubmenu === 'viewForms'}
			<div class="container mx-auto">
				<h2 class="text-lg font-bold tracking-tight md:text-2xl">View Forms</h2>
				<p class="text-sm text-muted-foreground md:text-base">Here's a list of your Assessments!</p>
			</div>
		{:else if selectedSubmenu === 'library'}
			<h2 class="text-lg font-bold tracking-tight md:text-2xl">Make library</h2>
			<p class="text-sm text-muted-foreground md:text-base">Here's a list of your Assessments!</p>
		{:else if selectedSubmenu === 'importForm'}
			<h2 class="text-lg font-bold tracking-tight md:text-2xl">Import Form</h2>
			<p class="text-sm text-muted-foreground md:text-base">Here's a list of your Assessments!</p>
		{:else if selectedSubmenu === 'viewResponses'}
			<h2 class="text-lg font-bold tracking-tight md:text-2xl">Responses</h2>
			<p class="text-sm text-muted-foreground md:text-base">
				Here's a list of responses to your forms.
			</p>
		{:else if selectedSubmenu === 'exportResponses'}
			<h2 class="text-lg font-bold tracking-tight md:text-2xl">Export Responses</h2>
			<p class="text-sm text-muted-foreground md:text-base">Export responses for offline use.</p>
		{:else if selectedSubmenu === 'profileSettings'}
			<h2 class="text-lg font-bold tracking-tight md:text-2xl">Profile Settings</h2>
			<p class="text-sm text-muted-foreground md:text-base">Adjust your profile details here.</p>
		{:else if selectedSubmenu === 'appSettings'}
			<h2 class="text-lg font-bold tracking-tight md:text-2xl">App Settings</h2>
			<p class="text-sm text-muted-foreground md:text-base">Configure application settings here.</p>
		{:else}
			<h2 class="text-lg font-bold tracking-tight md:text-2xl">Welcome back...!</h2>
			<p class="text-sm text-muted-foreground md:text-base">Here's a list of your Assessments!</p>
			<p class="text-sm text-muted-foreground md:text-base">Error in loading this page</p>
		{/if}
	</div>
</div>

<!-- Add New Template Modal -->
{#if showAddModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.target === e.currentTarget && closeAddModal()} onkeydown={(e) => e.key === 'Escape' && closeAddModal()}>
		<div class="scrollbar-hide max-h-[90%] max-w-[95%] overflow-y-auto rounded-md bg-background p-6 shadow-lg md:max-w-[85%] lg:max-w-[45%]" role="document">
			<div class="mb-4">
				<h2 class="text-lg font-semibold">Add New</h2>
				<p class="text-sm text-muted-foreground">Make changes to your form template here. Click save when you're done.</p>
			</div>
			<form method="POST" action="?/newAssessment" use:enhance>
				<TemplateForm {templateData} bind:errors />
				<div class="mt-4 flex justify-end gap-2">
					<button 
						type="button"
						class="{getButtonClasses('outline')}"
						onclick={closeAddModal}
					>
						Cancel
					</button>
					<button 
						class="{getButtonClasses('default')}" 
						type="submit"
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	@keyframes slide {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}
</style>
