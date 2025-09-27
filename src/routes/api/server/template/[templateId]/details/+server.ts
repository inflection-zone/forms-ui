import type { RequestEvent } from '@sveltejs/kit';
import { getFormTemplateDetails } from '../../../../services/form-template';

export const GET = async (event: RequestEvent) => {
    try {
        const templateId = event.params.templateId;
        console.log('Getting template details for templateId:', templateId);
        
        const response = await getFormTemplateDetails(templateId);
        console.log('Response from getFormTemplateDetails:', response);
        
        return new Response(JSON.stringify(response));
    } catch (err) {
        const error = err as Error;
        console.error(`Error getting template details: ${error.message}`);
        return new Response(JSON.stringify({
            Status: 'failure',
            HttpCode: 500,
            Message: error.message || 'An error occurred while getting template details.',
        }));
    }
};
