import { error } from '@sveltejs/kit';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getFormTemplateDetails } from '../../../../../api/services/form-template';

//////////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    console.log('Form load called.............');
	event.depends('app:allNodes');
	try {
		const assessmentTemplateId = event.params.templateId;
		const response = await getFormTemplateDetails(assessmentTemplateId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}

		const templateInfo = response.Data;
		return {
			assessmentTemplateId,
			templateInfo,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving assessment templates: ${error}`);
	}
};

export const actions = {
	default: async () => {
		console.log('result is ');
	}
	// createQuestion: async (event: RequestEvent) => {
	// 	console.log('result is ');
	// 	// const request = event.request;
	// 	const userId = event.params.userId;
	// 	const assessmentId = event.params.assessmentId;

	// 	const form = await superValidate(event, zod(questionSchema));
	// 	if (!form.valid) {
	// 		return fail(400, {
	// 			form,
	// 		});
	// 	}
	// 	console.log("This is form data", form.data);
	// 	console.log("This is form data", (form.data.options));

	// 	const response = await updateQuestion(
	// 		form.data.id,
	// 		// assessmentId,
	// 		// form.data.parentSectionId,
	// 		form.data.title,
	// 		form.data.description,
	// 		form.data.responseType,
	// 		form.data.score,
	// 		form.data.correctAnswer,
	// 		form.data.hint,
	// 		form.data.questionImageUrl,
	// 		form.data.rangeMin,
	// 		form.data.rangeMax,
	// 		form.data.options

	// 	);
	// 	console.log(chalk.hex('#6a329f')('response from question', response));

	// 	if (response.Status === 'failure' || response.HttpCode !== 200) {
	// 		toast.error('Event has not been created')
	// 		throw redirect(303, `user/${userId}/assessment/${assessmentId}`);
	// 	}
	// 	toast.success("Question Added succeccsfully !")
	// 	throw redirect(303, `/user/${userId}/assessment/${assessmentId}/question`,);
	// },

	////

	// updateQuestion: async (event: RequestEvent) => {
	// 	console.log('result is ');
	// 	const userId = event.params.userId;
	// 	const templateId = event.params.templateId;
	// 	const form = await superValidate(event, zod(questionSchema));
	// 	console.log('result is ', form);

	// 	if (!form.valid) {
	// 		return fail(400, { form });
	// 	}


	// 	let options = [];
	// 	if (form.data.responseType === 'SingleChoiceSelection' || form.data.responseType === 'MultiChoiceSelection' || form.data.responseType === 'Boolean') {


	// 		try {
	// 			const parsedOptions = JSON.parse(form.data.options[0]);
	// 			options = parsedOptions.map((option, index) => ({
	// 				Text: option.Text,
	// 				Sequence: option.Sequence || (index + 1).toString(),
	// 				ImageUrl: option.ImageUrl
	// 			}));
	// 		} catch (error) {
	// 			console.error("Error parsing options:", error);
	// 			return fail(400, { form, message: "Invalid options format" });
	// 		}
	// 		console.log("Reconstructed options:", JSON.stringify(options));
	// 	}

	// 	const response = await updateQuestion(
	// 		form.data.id,
	// 		form.data.title,
	// 		form.data.description,
	// 		form.data.responseType,
	// 		form.data.score,
	// 		form.data.correctAnswer,
	// 		form.data.hint,
	// 		form.data.questionImageUrl,
	// 		form.data.rangeMin,
	// 		form.data.rangeMax,
	// 		options
	// 	);

	// 	console.log(chalk.hex('#6a329f')('Response from updation of Question', response));

	// 	if (response.Status === 'failure' || response.HttpCode !== 200) {
	// 		// toast.error('Question has not been created');
	// 		throw redirect(303, `/users/${userId}/forms/${templateId}`);
	// 	}

	// 	// toast.success("Question added successfully!");
	// 	throw redirect(303, `/users/${userId}/forms/${templateId}/forms`);
	// },


	// updateSection: async (event: RequestEvent) => {
	// 	const userId = event.params.userId;
	// 	const templateId = event.params.templateId;

	// 	const form = await superValidate(event, zod(sectionSchema));
	// 	if (!form.valid) {
	// 		return fail(400, {
	// 			form,
	// 		});
	// 	}
	// 	console.log("This is form data", form.data);
	// 	const response = await updateSection(
	// 		// ParentTemplateId,
	// 		form.data.id,
	// 		form.data.parentSectionId,
	// 		form.data.title,
	// 		form.data.description,
	// 		form.data.sectionIdentifier,
	// 		// form.data.sequence
	// 	);
	// 	// console.log(chalk.hex('#09FA25')("this is from server", JSON.stringify(response), "page.server.ts file"));

	// 	if (response.Status === 'failure' || response.HttpCode !== 200) {
	// 		throw redirect(303, `preview`);
	// 	}
	// 	// toast.success("Form section Added succeccsfully !")
	// 	throw redirect(303, `/users/${userId}/forms/${templateId}/forms`,);
	// }
};
