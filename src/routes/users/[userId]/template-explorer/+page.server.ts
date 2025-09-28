import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
	const { userId } = params;

	try {
		// In a real app, this would fetch from your template marketplace API
		// For now, return mock template data
		const mockTemplates = [
			{
				id: 'template-1',
				title: 'Customer Feedback Survey',
				description: 'Comprehensive customer satisfaction survey with rating scales and open-ended questions',
				category: 'Survey',
				tags: ['customer', 'feedback', 'satisfaction'],
				author: 'Inflection Forms',
				rating: 4.8,
				downloads: 1250,
				preview: '/templates/customer-feedback.png',
				fields: 12,
				estimatedTime: '5-8 minutes',
				createdAt: '2024-01-15T00:00:00Z',
				isPopular: true,
				isFree: true
			},
			{
				id: 'template-2',
				title: 'Event Registration Form',
				description: 'Professional event registration with attendee details, preferences, and payment integration',
				category: 'Registration',
				tags: ['event', 'registration', 'payment'],
				author: 'Inflection Forms',
				rating: 4.9,
				downloads: 890,
				preview: '/templates/event-registration.png',
				fields: 18,
				estimatedTime: '3-5 minutes',
				createdAt: '2024-01-10T00:00:00Z',
				isPopular: true,
				isFree: true
			},
			{
				id: 'template-3',
				title: 'Employee Onboarding Checklist',
				description: 'Complete onboarding workflow with document uploads and task tracking',
				category: 'HR',
				tags: ['hr', 'onboarding', 'checklist'],
				author: 'HR Solutions',
				rating: 4.7,
				downloads: 650,
				preview: '/templates/employee-onboarding.png',
				fields: 25,
				estimatedTime: '10-15 minutes',
				createdAt: '2024-01-08T00:00:00Z',
				isPopular: false,
				isFree: true
			},
			{
				id: 'template-4',
				title: 'Product Research Survey',
				description: 'Market research template with conditional logic and advanced analytics',
				category: 'Research',
				tags: ['research', 'market', 'analytics'],
				author: 'Research Labs',
				rating: 4.6,
				downloads: 420,
				preview: '/templates/product-research.png',
				fields: 15,
				estimatedTime: '8-12 minutes',
				createdAt: '2024-01-05T00:00:00Z',
				isPopular: false,
				isFree: false,
				price: 19.99
			},
			{
				id: 'template-5',
				title: 'Healthcare Patient Intake',
				description: 'HIPAA-compliant patient intake form with medical history and insurance details',
				category: 'Healthcare',
				tags: ['healthcare', 'patient', 'hipaa'],
				author: 'MedForms',
				rating: 4.9,
				downloads: 320,
				preview: '/templates/patient-intake.png',
				fields: 22,
				estimatedTime: '6-10 minutes',
				createdAt: '2024-01-03T00:00:00Z',
				isPopular: false,
				isFree: false,
				price: 29.99
			},
			{
				id: 'template-6',
				title: 'Contact Us Form',
				description: 'Simple and effective contact form with file attachments and department routing',
				category: 'Contact',
				tags: ['contact', 'support', 'simple'],
				author: 'Inflection Forms',
				rating: 4.5,
				downloads: 2100,
				preview: '/templates/contact-us.png',
				fields: 8,
				estimatedTime: '2-3 minutes',
				createdAt: '2024-01-01T00:00:00Z',
				isPopular: true,
				isFree: true
			}
		];

		const categories = ['All', 'Survey', 'Registration', 'HR', 'Research', 'Healthcare', 'Contact'];

		return {
			userId,
			templates: mockTemplates,
			categories,
			totalTemplates: mockTemplates.length,
			popularTemplates: mockTemplates.filter(t => t.isPopular),
			freeTemplates: mockTemplates.filter(t => t.isFree)
		};

	} catch (error) {
		console.error('Template explorer load error:', error);
		
		// Return fallback data
		return {
			userId,
			templates: [],
			categories: ['All'],
			totalTemplates: 0,
			popularTemplates: [],
			freeTemplates: []
		};
	}
};
