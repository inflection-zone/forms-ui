import type { RequestEvent } from '@sveltejs/kit';
import { searchFormSubmission } from '../../../services/submission';

export const GET = async (event: RequestEvent) => {
    try {
        const url = new URL(event.request.url);
        const searchParams = Object.fromEntries(url.searchParams.entries());
        
        console.log('Search params for submission:', searchParams);
        
        const response = await searchFormSubmission(searchParams);
        console.log('Response from searchFormSubmission:', response);
        
        return new Response(JSON.stringify(response));
    } catch (err) {
        const error = err as Error;
        console.error(`Error searching form submission: ${error.message}`);
        return new Response(JSON.stringify({
            Status: 'failure',
            HttpCode: 500,
            Message: error.message || 'An error occurred while searching form submission.',
        }));
    }
};
