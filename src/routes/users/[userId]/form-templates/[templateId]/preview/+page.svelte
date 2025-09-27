<script lang="ts">
	import { Template } from '$lib/index';
	import type { PageServerData } from './$types';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card/index.js';
	import { cleanAssessmentTemplate } from '$lib/utils';
	//////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	const userId = page.params.userId;
	const templateId = page.params.templateId;
	$inspect(data)

	let section = $state(data.assessmentTemplate.FormSections[0].Subsections);
	let templateInfo = $state(data.assessmentTemplate);
	let sections = cleanAssessmentTemplate(section);
	
</script>

<div class="card container h-full w-full px-6 md:px-16 pt-4 mt-10 ">
	<Breadcrumb.Root>
		<Breadcrumb.List class="flex">
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/users/{userId}/form-templates">Form Templates</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/users/{userId}/form-templates/{templateId}/dashboard">{templateInfo.Title || 'Untitled Form'}</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>Preview</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<div class="mx-auto md:w-3/4 w-full rounded-md border-gray-400 border bg-[#F6F8FA] dark:bg-[#0a0a0b]  p-5 my-10  ">

		{#if templateInfo}
			<Card.Root>
				<div class=" relative mx-auto h-fit rounded-md border border-gray-400  pb-7 pt-5 bg-[#f9fafb] dark:bg-[#0a0a0b] ">
					<Card.Title class="absolute right-3 top-2 mr-0 mt-0  text-base sm:text-2xl font-semibold">
						{templateInfo.Type}
					</Card.Title>
					<div class="flex h-full flex-col items-center justify-center  ">
						<h2 class="mt-5 text-center text-3xl font-bold   ">
							{templateInfo.Title}
						</h2>
						<div class="mt-2 flex w-full flex-row justify-center">
							<Card.Description class="ml-auto text-sm">
								{templateInfo.Description || ''}
							</Card.Description>
							<p class="ml-auto mr-3 text-base">
								Version: {templateInfo.CurrentVersion}
							</p>
						</div>
					</div>
				</div>
			</Card.Root>
		{/if}
		<Template {sections} />
	</div>
</div>
