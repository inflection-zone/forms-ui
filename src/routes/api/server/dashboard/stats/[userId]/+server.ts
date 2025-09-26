import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { userId } = params;

	try {
		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 100));

		// Return dummy stats data
		const stats = {
			totalTemplates: Math.floor(Math.random() * 50) + 10,
			totalSubmissions: Math.floor(Math.random() * 1000) + 500,
			activeTemplates: Math.floor(Math.random() * 30) + 5,
			storageUsed: Math.floor(Math.random() * 800) + 200, // MB
			storageLimit: 1000, // MB
			apiCalls: Math.floor(Math.random() * 3000) + 2000,
			apiLimit: 5000,
			responseRate: Math.floor(Math.random() * 40) + 60, // 60-100%
			recentGrowth: {
				templates: Math.floor(Math.random() * 20) + 5,
				submissions: Math.floor(Math.random() * 100) + 50,
				users: Math.floor(Math.random() * 10) + 2
			}
		};

		return json({
			HttpCode: 200,
			State: 'success',
			Message: 'Dashboard stats retrieved successfully',
			Data: stats
		});

	} catch (error) {
		console.error('Dashboard stats error:', error);
		return json({
			HttpCode: 500,
			State: 'error',
			Message: 'Failed to retrieve dashboard stats',
			Data: null
		}, { status: 500 });
	}
};
