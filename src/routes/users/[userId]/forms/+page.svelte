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
	let showAddModal = $state(false);

	// console.log("This is form data", form,"And this is errors", errors);
	$inspect(errors);

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

<div class="w-full bg-background">
	<!-- Main Content -->
	<div class="w-full p-6">
		<div class="flex flex-col md:flex-row md:items-center mb-6">
			<div>
				<h2 class="text-lg font-bold tracking-tight md:text-2xl">Forms</h2>
				<p class="text-sm text-muted-foreground md:text-base">
					Manage and create your forms
				</p>
			</div>
			<button 
				class="{getButtonClasses('default')} my-2 w-28 md:ml-auto"
				onclick={openAddModal}
			>
				Add New
			</button>
		</div>
		<!-- Template Table -->
		<TemplateTable {data} bind:errors {handleTemplateUpdate}/>
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
			<form method="POST" action="?/newAssessment" use:enhance={() => {
				return ({ result }) => {
					if (result.type === 'success') {
						closeAddModal();
					}
				};
			}}>
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
