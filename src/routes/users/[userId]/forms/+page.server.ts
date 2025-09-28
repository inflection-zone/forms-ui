import { error, type Actions, type RequestEvent, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createFormTemplate, getFormTemplateById } from '../../../api/services/form-template';
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { assessmentSchema } from '$lib/components/template/assessment-schema';
import { redirect } from 'sveltekit-flash-message/server';
import { successMessage } from "$lib/components/toast/message.utils.js";
import type { z } from "zod";
import { IndexedDB } from "$lib/utils/indexedDB";

////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const { userId } = event.params;
	console.log('Form template load called.............');
	event.depends('app:template');

	
	const FAVOURITE_TEMPLATES = `Templates`;
	const db = new IndexedDB<{ id: string; payload: any }>('form-submissions', 'unsaved_answers');
	
	try {
		const ownerUserId = userId;
		const response = await getFormTemplateById({
			ownerUserId:ownerUserId,
			orderBy: "Title",
			order: "ascending"
		});

		
		// depends('app:assessmentTemplate')
		// const response = await searchAssessmentTemplates(sessionId, {
			// 	orderBy: "Title",
			// 	order: "ascending"
			// });
			if (response.Status === 'failure' || response.HttpCode !== 200) {
				throw error(response.HttpCode, response.Message);
			}
		// const assessmentTemplate = response?.Data?.Items ?? [];
		const assessmentTemplate = response.Data ?? [];
		
			// console.log(assessmentTemplate)
		// const assessmentTemplate = response.Data.AssessmentTemplateRecords;
		return {
			assessmentTemplate,
			message: response.Message,
			// form: await superValidate(initialData, zod(assessmentSchema)),
			form: await superValidate(zod(assessmentSchema)),
		};

	} catch (error) {
		console.error(`Error retrieving assessment templates: ${error}`);

		return {
			assessmentTemplate: [],
			message: 'Failed to load assessment templates.',
			form: await superValidate(zod(assessmentSchema)),
		};
	}
};


export const actions = {
	newAssessment: async (event: RequestEvent) => {
		const request = event.request;
		const data = await request.formData();
		const formDataValue = Object.fromEntries(data);
		
		// const form = await superValidate(event, zod(assessmentSchema));
		
		type AssessmentTemplateSchema = z.infer<typeof assessmentSchema>;

		let result: AssessmentTemplateSchema = {};
		try {
			result = assessmentSchema.parse(formDataValue);
			console.log('result', result);
		} catch (err) {
			const { fieldErrors: errors } = err.flatten();
			console.log(errors);
			const { ...rest } = formDataValue;
			return {
				data: rest,
				errors
			};
		}

		// if (!form.valid) {
		// 	return fail(400, {
		// 		form,
		// 	});
		// }
		// const request = event.request;
		const userId = event.params.userId

		const response = await createFormTemplate(
			result.id,
			result.Title,
			result.Description,
			result.CurrentVersion,
			result.TenantCode,
			result.ItemsPerPage,
			result.Type,
			userId,
			result.DefaultSectionNumbering
		);

		const templateId = response.Data.id;

		if (response.Status === 'failure' || response.HttpCode !== 201) {
			throw redirect(
				303,
				`/users/${userId}/forms`,
			);
		}

		throw redirect(
			303,
			`/users/${userId}/forms/${templateId}/forms`,
			successMessage(`Form template created successfully!`),
			event
		);
	},
} satisfies Actions;


