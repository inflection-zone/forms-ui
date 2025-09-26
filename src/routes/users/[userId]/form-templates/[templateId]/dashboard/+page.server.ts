import { error } from '@sveltejs/kit';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchQuestionResponse } from '../../../../../api/services/question-response';
import { getFormTemplateDetails } from '../../../../../api/services/form-template';

//////////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    console.log('Form load called.............');
	event.depends('app:allNodes');

	try {
		const formTemplateId = event.params.templateId;
		const response = await searchQuestionResponse({formTemplateId});
        const details = await getFormTemplateDetails(formTemplateId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}

        console.log('Response is ', details);

		const templateInfo = response.Data;
		return {
			templateInfo,
			details,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving assessment templates: ${error}`);
	}
};