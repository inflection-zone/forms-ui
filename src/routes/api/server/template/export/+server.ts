import type { RequestEvent } from '@sveltejs/kit';
import { exportFormTemplates } from '../../../services/form-template';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	const request = event.request;
	const data = await request.json();

	try {
		const blob = await exportFormTemplates(
			// data.sessionId,
			data.templateId,
		);
		return new Response(blob, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (err) {
		console.error(`Error in exporting careplan: ${err.message}`);
		return new Response(err.message);
	}
};