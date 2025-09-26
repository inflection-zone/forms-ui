import { json, type RequestEvent } from '@sveltejs/kit';
import { get_ } from '../../../../services/common';

export async function GET(event: RequestEvent) {
    try {
        const category = event.params.category;
        const response = await get_(`http://localhost:5555/api/v1/field-library/category/${category}`);
        return json(response);
    } catch (error) {
        console.error('Field library category API error:', error);
        return json({
            Status: 'failure',
            Message: 'Internal server error',
            HttpCode: 500
        });
    }
}
