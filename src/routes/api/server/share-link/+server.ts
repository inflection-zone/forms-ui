import type { RequestEvent } from '@sveltejs/kit';
// import { createShareLink } from '../../services/share-link';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createShareLink } from '../../services/share-link';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        const data = await event.request.json();

        const response = await createShareLink(data);

        return ResponseHandler.success(response);
    } catch (error) {
        return ResponseHandler.handleError(error);
    }
};
