import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const { userId } = params;
	const limit = Number(url.searchParams.get('limit')) || 5;

	try {
		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 120));

		// Generate dummy activity data
		const activities = [];
		const activityTypes = [
			'Form submission received',
			'Template created',
			'Template updated',
			'Template published',
			'User registered via form',
			'Form response exported',
			'Template shared',
			'Form analytics viewed',
			'Submission reviewed',
			'Template duplicated'
		];

		const templateNames = [
			'Customer Feedback Survey',
			'Product Registration',
			'Event Registration',
			'Contact Form',
			'Newsletter Signup'
		];

		for (let i = 0; i < Math.min(limit, 15); i++) {
			const randomDate = new Date();
			randomDate.setHours(randomDate.getHours() - Math.floor(Math.random() * 72)); // Last 3 days

			const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
			const templateName = templateNames[Math.floor(Math.random() * templateNames.length)];

			activities.push({
				id: `activity_${Math.random().toString(36).substring(2, 15)}`,
				type: activityType.toLowerCase().replace(/\s+/g, '_'),
				description: `${activityType} for "${templateName}"`,
				templateName: templateName,
				templateId: `tmpl_${Math.random().toString(36).substring(2, 10)}`,
				userId: userId,
				timestamp: randomDate.toISOString(),
				CreatedAt: randomDate.toISOString(),
				metadata: {
					ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
					userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
					location: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)]
				},
				severity: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)]
			});
		}

		// Sort by timestamp descending
		activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

		return json({
			HttpCode: 200,
			State: 'success',
			Message: 'Dashboard activity retrieved successfully',
			Data: {
				Items: activities,
				TotalCount: activities.length,
				Page: 1,
				PageSize: limit
			}
		});

	} catch (error) {
		console.error('Dashboard activity error:', error);
		return json({
			HttpCode: 500,
			State: 'error',
			Message: 'Failed to retrieve dashboard activity',
			Data: null
		}, { status: 500 });
	}
};
