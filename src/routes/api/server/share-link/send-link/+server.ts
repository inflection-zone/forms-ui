import type { RequestEvent } from '@sveltejs/kit';
import chalk from 'chalk';
// import { sendLinkViaEmail } from '../../../services/share-link';
import { sendSingleLinkViaEmail } from '../../../services/share-link';
import { ResponseHandler } from '$lib/utils/response.handler';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        const data = await event.request.json();
        const response = await sendSingleLinkViaEmail(data);

        return ResponseHandler.success(response);
    } catch (error) {
        return ResponseHandler.handleError(error);
    }
};
