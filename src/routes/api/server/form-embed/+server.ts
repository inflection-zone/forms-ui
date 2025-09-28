import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BACKEND_API_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const { templateId } = await request.json();

		if (!templateId) {
			return json(
				{ error: 'Template ID is required' },
				{ status: 400 }
			);
		}

		// Get backend API URL from environment
		const backendApiUrl = BACKEND_API_URL || 'http://localhost:3000';
		const embedUrl = `${backendApiUrl}/form-embeddings/${templateId}/how-to-embed-charcoal-form`;

		// Call backend API to get embed content
		const response = await fetch(embedUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});

		if (!response.ok) {
			console.error(`Backend API error: ${response.status} ${response.statusText}`);
			return json(
				{ error: 'Failed to fetch embed content from backend' },
				{ status: response.status }
			);
		}

		const embedData = await response.json();

		return json({
			success: true,
			data: embedData
		});

	} catch (error) {
		console.error('Embed API error:', error);
		return json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
};
