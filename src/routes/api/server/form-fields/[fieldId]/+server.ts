import { type RequestEvent } from '@sveltejs/kit';
import { deleteQuestion, getQuestionById } from '../../../services/form-field';

/////////////////////////////////////////////////////////////////////
export const GET = async (event: RequestEvent) => {
    const fieldId = event.params.fieldId;

    try {
        const response = await getQuestionById(
            fieldId,
        );
        return new Response(JSON.stringify(response));
    } catch (err) {
        console.error(`Error fetching the form field: ${err}`);
        return new Response(err.message);
    }
};

export const DELETE = async (event: RequestEvent) => {
    try {
        const fieldId = event.params.fieldId;
        console.log('Deleted form field id is:', fieldId);
        const response = await deleteQuestion(fieldId);
        console.log('Deleted form field response is:', response);
        return new Response(JSON.stringify(response));
    } catch (error) {
        console.error(`Error deleting the form field: ${error.message}`);
    }
}; 