import { error } from '@sveltejs/kit';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchQuestionResponse } from '../../../../../api/services/question-response';
import { getFormTemplateDetails } from '../../../../../api/services/form-template';
import { searchFormSubmission } from '../../../../../api/services/submission';

//////////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    console.log('Form load called.............');
	event.depends('app:allNodes');

	try {
		const formTemplateId = event.params.templateId;
		const response = await searchQuestionResponse({formTemplateId});
        const details = await getFormTemplateDetails(formTemplateId);
		const submissions = await searchFormSubmission({formTemplateId});

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}

		const templateInfo = response.Data;
		return {
			templateInfo,
			details,
			submissions,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving assessment templates: ${error}`);
	}
};