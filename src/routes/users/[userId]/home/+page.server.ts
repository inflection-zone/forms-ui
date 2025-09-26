import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
	const { userId } = params;

	try {
		// Fetch dashboard stats and data
		const [
			statsResponse,
			templatesResponse,
			submissionsResponse,
			recentActivityResponse
		] = await Promise.all([
			fetch(`/api/server/dashboard/stats/${userId}`),
			fetch(`/api/server/template?userId=${userId}&limit=5`),
			fetch(`/api/server/submissions/recent/${userId}?limit=10`),
			fetch(`/api/server/dashboard/activity/${userId}?limit=5`)
		]);

		// Parse responses with fallbacks
		const stats = statsResponse.ok ? await statsResponse.json() : {
			totalTemplates: 0,
			totalSubmissions: 0,
			activeTemplates: 0,
			storageUsed: 0,
			storageLimit: 1000,
			apiCalls: 0,
			apiLimit: 5000
		};

		const templates = templatesResponse.ok ? await templatesResponse.json() : {
			Items: [],
			TotalCount: 0
		};

		const submissions = submissionsResponse.ok ? await submissionsResponse.json() : {
			Items: [],
			TotalCount: 0
		};

		const recentActivity = recentActivityResponse.ok ? await recentActivityResponse.json() : {
			Items: []
		};

		return {
			userId,
			stats: stats.Data || stats,
			templates: templates.Items || [],
			totalTemplates: templates.TotalCount || 0,
			submissions: submissions.Items || [],
			totalSubmissions: submissions.TotalCount || 0,
			recentActivity: recentActivity.Items || [],
			user: {
				name: 'Developer',
				role: 'Admin'
			}
		};

	} catch (error) {
		console.error('Dashboard load error:', error);
		
		// Return fallback data
		return {
			userId,
			stats: {
				totalTemplates: 0,
				totalSubmissions: 0,
				activeTemplates: 0,
				storageUsed: 0,
				storageLimit: 1000,
				apiCalls: 0,
				apiLimit: 5000
			},
			templates: [],
			totalTemplates: 0,
			submissions: [],
			totalSubmissions: 0,
			recentActivity: [],
			user: {
				name: 'Developer',
				role: 'Admin'
			}
		};
	}
};
