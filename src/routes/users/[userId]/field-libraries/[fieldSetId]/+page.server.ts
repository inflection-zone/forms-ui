import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
	const { userId, fieldSetId } = params;

	try {
		// In a real app, this would fetch the specific field set from API
		// Mock detailed field set data with organized field categories
		const mockFieldSets: Record<string, any> = {
			'healthcare-patient-intake': {
				id: 'healthcare-patient-intake',
				name: 'Patient Intake Form',
				description: 'Complete patient information collection with medical history and insurance details',
				category: 'Healthcare',
				industry: 'Healthcare',
				fieldCount: 18,
				isCustom: false,
				author: 'MedForms Library',
				downloads: 1240,
				rating: 4.9,
				tags: ['patient', 'medical', 'intake', 'hipaa'],
				fieldCategories: [
					{
						name: 'Basic Info',
						icon: 'material-symbols:person',
						fields: [
							{ id: 'patient-name', name: 'Patient Name', type: 'text', required: true, icon: 'material-symbols:person' },
							{ id: 'date-of-birth', name: 'Date of Birth', type: 'date', required: true, icon: 'material-symbols:calendar-today' },
							{ id: 'gender', name: 'Gender', type: 'select', required: true, icon: 'material-symbols:person' },
							{ id: 'phone', name: 'Phone Number', type: 'tel', required: true, icon: 'material-symbols:phone' },
							{ id: 'email', name: 'Email Address', type: 'email', required: false, icon: 'material-symbols:email' }
						]
					},
					{
						name: 'Medical Information',
						icon: 'material-symbols:medical-services',
						fields: [
							{ id: 'insurance-provider', name: 'Insurance Provider', type: 'text', required: false, icon: 'material-symbols:card-membership' },
							{ id: 'policy-number', name: 'Policy Number', type: 'text', required: false, icon: 'material-symbols:numbers' },
							{ id: 'primary-physician', name: 'Primary Physician', type: 'text', required: false, icon: 'material-symbols:medical-services' },
							{ id: 'medical-history', name: 'Medical History', type: 'textarea', required: false, icon: 'material-symbols:history' },
							{ id: 'current-medications', name: 'Current Medications', type: 'textarea', required: false, icon: 'material-symbols:medication' },
							{ id: 'allergies', name: 'Known Allergies', type: 'textarea', required: false, icon: 'material-symbols:warning' }
						]
					},
					{
						name: 'Emergency Contact',
						icon: 'material-symbols:emergency',
						fields: [
							{ id: 'emergency-name', name: 'Emergency Contact Name', type: 'text', required: true, icon: 'material-symbols:person' },
							{ id: 'emergency-relation', name: 'Relationship', type: 'select', required: true, icon: 'material-symbols:family-restroom' },
							{ id: 'emergency-phone', name: 'Emergency Phone', type: 'tel', required: true, icon: 'material-symbols:phone' }
						]
					}
				],
				createdAt: '2024-01-15T00:00:00Z',
				updatedAt: '2024-01-20T00:00:00Z'
			},
			'ecommerce-customer-data': {
				id: 'ecommerce-customer-data',
				name: 'E-commerce Customer Data',
				description: 'Customer registration and profile fields for online stores',
				category: 'Customer Management',
				industry: 'E-commerce',
				fieldCount: 14,
				isCustom: false,
				author: 'Commerce Fields',
				downloads: 890,
				rating: 4.7,
				tags: ['customer', 'registration', 'profile', 'shipping'],
				fieldCategories: [
					{
						name: 'Basic Info',
						icon: 'material-symbols:person',
						fields: [
							{ id: 'full-name', name: 'Full Name', type: 'text', required: true, icon: 'material-symbols:person' },
							{ id: 'email', name: 'Email Address', type: 'email', required: true, icon: 'material-symbols:email' },
							{ id: 'phone', name: 'Phone Number', type: 'tel', required: false, icon: 'material-symbols:phone' }
						]
					},
					{
						name: 'Address Information',
						icon: 'material-symbols:location-on',
						fields: [
							{ id: 'shipping-address', name: 'Shipping Address', type: 'address', required: true, icon: 'material-symbols:local-shipping' },
							{ id: 'billing-address', name: 'Billing Address', type: 'address', required: false, icon: 'material-symbols:receipt' },
							{ id: 'country', name: 'Country', type: 'select', required: true, icon: 'material-symbols:public' }
						]
					},
					{
						name: 'Preferences',
						icon: 'material-symbols:settings',
						fields: [
							{ id: 'marketing-emails', name: 'Marketing Emails', type: 'checkbox', required: false, icon: 'material-symbols:email' },
							{ id: 'sms-notifications', name: 'SMS Notifications', type: 'checkbox', required: false, icon: 'material-symbols:sms' },
							{ id: 'newsletter', name: 'Newsletter Subscription', type: 'checkbox', required: false, icon: 'material-symbols:newspaper' }
						]
					}
				],
				createdAt: '2024-01-12T00:00:00Z',
				updatedAt: '2024-01-18T00:00:00Z'
			},
			'my-custom-set-1': {
				id: 'my-custom-set-1',
				name: 'My Event Fields',
				description: 'Custom field set for event management and registration',
				category: 'Custom',
				industry: 'Custom',
				fieldCount: 12,
				isCustom: true,
				author: 'You',
				downloads: 0,
				rating: 0,
				tags: ['custom', 'event', 'registration'],
				fieldCategories: [
					{
						name: 'Event Details',
						icon: 'material-symbols:event',
						fields: [
							{ id: 'event-name', name: 'Event Name', type: 'text', required: true, icon: 'material-symbols:event' },
							{ id: 'event-date', name: 'Event Date', type: 'date', required: true, icon: 'material-symbols:calendar-today' },
							{ id: 'event-location', name: 'Event Location', type: 'address', required: true, icon: 'material-symbols:location-on' },
							{ id: 'attendees', name: 'Number of Attendees', type: 'number', required: true, icon: 'material-symbols:group' }
						]
					},
					{
						name: 'Additional Information',
						icon: 'material-symbols:info',
						fields: [
							{ id: 'special-requirements', name: 'Special Requirements', type: 'textarea', required: false, icon: 'material-symbols:assignment' },
							{ id: 'dietary-restrictions', name: 'Dietary Restrictions', type: 'textarea', required: false, icon: 'material-symbols:restaurant' }
						]
					}
				],
				createdAt: '2024-01-25T00:00:00Z',
				updatedAt: '2024-01-25T00:00:00Z'
			}
		};

		const fieldSet = mockFieldSets[fieldSetId];
		
		if (!fieldSet) {
			throw error(404, 'Field set not found');
		}

		return {
			userId,
			fieldSet,
			fieldSetId
		};

	} catch (err) {
		console.error('Field set load error:', err);
		throw error(404, 'Field set not found');
	}
};
