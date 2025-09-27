import { type RequestEvent } from '@sveltejs/kit';
import { createSection, deleteSection, updateSection } from '../../services/section';
import { json } from '@sveltejs/kit';
import { updateFormTemplate } from '../../services/form-template';

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

        console.log('data from api/server/template:', data);

        const response = await updateFormTemplate(
            data.id,
            data.Title,
            data.Description,
            data.TenantCode,
            data.CurrentVersion,
            data.Type,
            data.ItemsPerPage,
            data.IsFavourite
        );
        // return json({
        //     status: 'success',
        //     message: response.message || 'Section updated successfully!',
        //     data: response,
        // });
        console.log(response);
        
        return new Response(JSON.stringify(response))
    } catch (err) {
        const error = err as CustomError;
        console.error(`Error updating the section: ${error.message}`);
        return json(
            {
                status: 'error',
                message: error.message || 'An error occurred while updating the section.',
                details: error.details || null,
            },
            { status: 500 }
        );
    }
};