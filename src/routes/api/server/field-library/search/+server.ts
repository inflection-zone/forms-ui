import { json, type RequestEvent } from '@sveltejs/kit';
import { get_ } from '../../../services/common';

export async function GET(event: RequestEvent) {
    try {
        const url = new URL(event.request.url);
        const query = url.searchParams.get('query');
        const category = url.searchParams.get('category');
        
        let searchUrl = `http://localhost:5555/api/v1/field-library/search?query=${encodeURIComponent(query || '')}`;
        if (category) {
            searchUrl += `&category=${encodeURIComponent(category)}`;
        }
        
        const response = await get_(searchUrl);
        return json(response);
    } catch (error) {
        console.error('Field library search API error:', error);
        return json({
            Status: 'failure',
            Message: 'Internal server error',
            HttpCode: 500
        });
    }
}
