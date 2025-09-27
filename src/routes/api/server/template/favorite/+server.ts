import { type RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { toggleFormTemplateFavorite } from '../../../services/form-template';

////////////////////////////////////////////////////////////////////////////////////////////

// Custom error type for extended error properties
interface CustomError extends Error {
    statusCode?: number;
    details?: string;
}

////////////////////////////////////////////////////////////////////////////////////

export const PUT = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('data from api/server/template/favorite:', data);

        // Validate required fields
        if (!data.id || data.isFavourite === undefined) {
            return json(
                {
                    status: 'error',
                    message: 'Template ID and isFavourite status are required.',
                },
                { status: 400 }
            );
        }

        const response = await toggleFormTemplateFavorite(
            data.id,
            data.isFavourite
        );

        console.log('Favorite toggle response:', response);
        
        return new Response(JSON.stringify({
            status: 'success',
            message: `Form template ${data.isFavourite ? 'added to' : 'removed from'} favorites successfully!`,
            data: response
        }));
    } catch (err) {
        const error = err as CustomError;
        console.error(`Error toggling favorite status: ${error.message}`);
        return json(
            {
                status: 'error',
                message: error.message || 'An error occurred while updating favorite status.',
                details: error.details || null,
            },
            { status: 500 }
        );
    }
};
