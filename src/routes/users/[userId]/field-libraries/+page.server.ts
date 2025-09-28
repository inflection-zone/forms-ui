import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
	const { userId } = params;

	try {
		// In a real app, this would fetch from your field library API
		// Mock field sets data organized by industry and use case
		const mockFieldSets = [
			{
				id: 'healthcare-patient-intake',
				name: 'Patient Intake Form',
				description: 'Complete patient information collection with medical history and insurance details',
				category: 'Healthcare',
				industry: 'Healthcare',
				fieldCount: 18,
				isCustom: false,
				isPopular: true,
				author: 'MedForms Library',
				downloads: 1240,
				rating: 4.9,
				tags: ['patient', 'medical', 'intake', 'hipaa'],
				fields: [
					{ name: 'Patient Name', type: 'text', required: true },
					{ name: 'Date of Birth', type: 'date', required: true },
					{ name: 'Gender', type: 'select', required: true },
					{ name: 'Insurance Provider', type: 'text', required: false },
					{ name: 'Emergency Contact', type: 'text', required: true },
					{ name: 'Medical History', type: 'textarea', required: false }
				],
				createdAt: '2024-01-15T00:00:00Z',
				updatedAt: '2024-01-20T00:00:00Z'
			},
			{
				id: 'ecommerce-customer-data',
				name: 'E-commerce Customer Data',
				description: 'Customer registration and profile fields for online stores',
				category: 'Customer Management',
				industry: 'E-commerce',
				fieldCount: 14,
				isCustom: false,
				isPopular: true,
				author: 'Commerce Fields',
				downloads: 890,
				rating: 4.7,
				tags: ['customer', 'registration', 'profile', 'shipping'],
				fields: [
					{ name: 'Full Name', type: 'text', required: true },
					{ name: 'Email Address', type: 'email', required: true },
					{ name: 'Phone Number', type: 'tel', required: false },
					{ name: 'Shipping Address', type: 'address', required: true },
					{ name: 'Billing Address', type: 'address', required: false },
					{ name: 'Marketing Preferences', type: 'checkbox', required: false }
				],
				createdAt: '2024-01-12T00:00:00Z',
				updatedAt: '2024-01-18T00:00:00Z'
			},
			{
				id: 'hr-employee-onboarding',
				name: 'Employee Onboarding',
				description: 'Comprehensive employee data collection and document management',
				category: 'Human Resources',
				industry: 'HR',
				fieldCount: 22,
				isCustom: false,
				isPopular: false,
				author: 'HR Solutions',
				downloads: 650,
				rating: 4.8,
				tags: ['employee', 'onboarding', 'hr', 'documents'],
				fields: [
					{ name: 'Employee ID', type: 'text', required: true },
					{ name: 'Full Name', type: 'text', required: true },
					{ name: 'Department', type: 'select', required: true },
					{ name: 'Position Title', type: 'text', required: true },
					{ name: 'Start Date', type: 'date', required: true },
					{ name: 'Emergency Contact', type: 'text', required: true }
				],
				createdAt: '2024-01-10T00:00:00Z',
				updatedAt: '2024-01-15T00:00:00Z'
			},
			{
				id: 'education-student-enrollment',
				name: 'Student Enrollment',
				description: 'Student registration and academic information collection',
				category: 'Education',
				industry: 'Education',
				fieldCount: 16,
				isCustom: false,
				isPopular: true,
				author: 'EduForms',
				downloads: 420,
				rating: 4.6,
				tags: ['student', 'enrollment', 'academic', 'education'],
				fields: [
					{ name: 'Student Name', type: 'text', required: true },
					{ name: 'Student ID', type: 'text', required: true },
					{ name: 'Grade Level', type: 'select', required: true },
					{ name: 'Parent/Guardian', type: 'text', required: true },
					{ name: 'Academic History', type: 'textarea', required: false },
					{ name: 'Special Needs', type: 'textarea', required: false }
				],
				createdAt: '2024-01-08T00:00:00Z',
				updatedAt: '2024-01-12T00:00:00Z'
			},
			{
				id: 'finance-loan-application',
				name: 'Loan Application',
				description: 'Financial information and credit assessment fields',
				category: 'Financial Services',
				industry: 'Finance',
				fieldCount: 25,
				isCustom: false,
				isPopular: false,
				author: 'FinanceForm Pro',
				downloads: 320,
				rating: 4.5,
				tags: ['loan', 'finance', 'credit', 'banking'],
				fields: [
					{ name: 'Applicant Name', type: 'text', required: true },
					{ name: 'Annual Income', type: 'number', required: true },
					{ name: 'Employment Status', type: 'select', required: true },
					{ name: 'Loan Amount', type: 'number', required: true },
					{ name: 'Credit Score', type: 'number', required: false },
					{ name: 'Collateral Details', type: 'textarea', required: false }
				],
				createdAt: '2024-01-05T00:00:00Z',
				updatedAt: '2024-01-10T00:00:00Z'
			},
			{
				id: 'real-estate-property-listing',
				name: 'Property Listing',
				description: 'Real estate property information and listing details',
				category: 'Real Estate',
				industry: 'Real Estate',
				fieldCount: 20,
				isCustom: false,
				isPopular: false,
				author: 'RealtyFields',
				downloads: 280,
				rating: 4.4,
				tags: ['property', 'listing', 'real-estate', 'rental'],
				fields: [
					{ name: 'Property Address', type: 'address', required: true },
					{ name: 'Property Type', type: 'select', required: true },
					{ name: 'Square Footage', type: 'number', required: true },
					{ name: 'Number of Bedrooms', type: 'number', required: true },
					{ name: 'Number of Bathrooms', type: 'number', required: true },
					{ name: 'Property Description', type: 'textarea', required: false }
				],
				createdAt: '2024-01-03T00:00:00Z',
				updatedAt: '2024-01-08T00:00:00Z'
			},
			{
				id: 'my-custom-set-1',
				name: 'My Event Registration Set',
				description: 'Custom field set combining multiple custom fields for complete event management',
				category: 'Custom',
				industry: 'Custom',
				fieldCount: 3, // Number of custom fields in this set
				isCustom: true,
				isPopular: false,
				author: 'You',
				downloads: 0,
				rating: 0,
				tags: ['custom', 'event', 'registration'],
				customFields: [
					{ 
						id: 'custom-event-info',
						name: 'Event Information', 
						description: 'Basic event details with date and location',
						layout: 'layout-2-column',
						basicFields: ['text-single', 'datetime-date', 'text-single', 'number-integer']
					},
					{ 
						id: 'custom-attendee-details',
						name: 'Attendee Details', 
						description: 'Attendee contact information and preferences',
						layout: 'layout-1-column',
						basicFields: ['text-single', 'text-single', 'selection-multi', 'text-multi']
					},
					{ 
						id: 'custom-payment-info',
						name: 'Payment Information', 
						description: 'Payment details and billing information',
						layout: 'layout-2-column',
						basicFields: ['selection-dropdown', 'number-decimal', 'text-single']
					}
				],
				createdAt: '2024-01-25T00:00:00Z',
				updatedAt: '2024-01-25T00:00:00Z'
			}
		];

		const industries = ['All', 'Healthcare', 'E-commerce', 'HR', 'Education', 'Finance', 'Real Estate', 'Custom'];
		const categories = ['All', 'Customer Management', 'Human Resources', 'Education', 'Financial Services', 'Real Estate', 'Custom'];

		return {
			userId,
			fieldSets: mockFieldSets,
			industries,
			categories,
			totalFieldSets: mockFieldSets.length,
			customFieldSets: mockFieldSets.filter(fs => fs.isCustom),
			popularFieldSets: mockFieldSets.filter(fs => fs.isPopular),
			stats: {
				totalFields: mockFieldSets.reduce((sum, fs) => sum + fs.fieldCount, 0),
				customSets: mockFieldSets.filter(fs => fs.isCustom).length,
				importedSets: mockFieldSets.filter(fs => !fs.isCustom).length
			}
		};

	} catch (error) {
		console.error('Field library load error:', error);
		
		// Return fallback data
		return {
			userId,
			fieldSets: [],
			industries: ['All'],
			categories: ['All'],
			totalFieldSets: 0,
			customFieldSets: [],
			popularFieldSets: [],
			stats: {
				totalFields: 0,
				customSets: 0,
				importedSets: 0
			}
		};
	}
};
