import type { RequestEvent } from '@sveltejs/kit';
import { getQuestionsByTemplateId } from '../../../services/form-field';
// import chalk from 'chalk';
import { getSectionByTemplateId } from '../../../services/section';
import { getFormTemplateById } from '../../../services/form-template';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const templateId = { parentTemplateId: event.params.templateId };
        const response = await getQuestionsByTemplateId(templateId);

        const templateSectionId = { parentFormTemplateId: event.params.templateId };
        const res = await getSectionByTemplateId(templateSectionId);

        const templateformId = { id: event.params.templateId };
        const temp = await getFormTemplateById(templateformId);

        return new Response(JSON.stringify({
            formFields: response,
            sections: res,
            templates: temp
        }));
    } catch (err) {
        const error = err as Error;
        console.error(`Error retrieving form data: ${error.message}`);
        return new Response(JSON.stringify({
            Status: 'failure',
            HttpCode: 500,
            Message: error.message || 'An error occurred while retrieving form data.',
        }));
    }
};
