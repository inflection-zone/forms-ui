import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const { userId } = params;
	const limit = Number(url.searchParams.get('limit')) || 10;

	try {
		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 150));

		// Generate dummy submissions data
		const submissions = [];
		const templateNames = [
			'Customer Feedback Survey',
			'Product Registration Form',
			'Event Registration',
			'Contact Us Form',
			'Newsletter Signup',
			'Job Application',
			'Service Request',
			'Bug Report Form'
		];

		const statuses = ['completed', 'pending', 'reviewed'];

		for (let i = 0; i < Math.min(limit, 20); i++) {
			const randomDate = new Date();
			randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));

			submissions.push({
				id: `sub_${Math.random().toString(36).substring(2, 15)}`,
				templateId: `tmpl_${Math.random().toString(36).substring(2, 10)}`,
				templateName: templateNames[Math.floor(Math.random() * templateNames.length)],
				submittedBy: `user_${Math.random().toString(36).substring(2, 8)}`,
				submitterEmail: `user${i + 1}@example.com`,
				status: statuses[Math.floor(Math.random() * statuses.length)],
				submittedAt: randomDate.toISOString(),
				CreatedAt: randomDate.toISOString(),
				UpdatedAt: randomDate.toISOString(),
				responseCount: Math.floor(Math.random() * 20) + 1,
				data: {
					totalFields: Math.floor(Math.random() * 15) + 5,
					completedFields: Math.floor(Math.random() * 10) + 5
				}
			});
		}

		// Sort by date descending
		submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

		return json({
			HttpCode: 200,
			State: 'success',
			Message: 'Recent submissions retrieved successfully',
			Data: {
				Items: submissions,
				TotalCount: submissions.length,
				Page: 1,
				PageSize: limit
			}
		});

	} catch (error) {
		console.error('Recent submissions error:', error);
		return json({
			HttpCode: 500,
			State: 'error',
			Message: 'Failed to retrieve recent submissions',
			Data: null
		}, { status: 500 });
	}
};
