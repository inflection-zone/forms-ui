import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
	const { userId, fieldSetId } = params;

	try {
		// In a real app, this would fetch the custom field set from API
		// Mock data for custom field set editing
		const mockCustomFieldSet = {
			id: fieldSetId,
			name: 'My Event Fields',
			description: 'Custom field set for event management and registration',
			category: 'Custom',
			industry: 'Custom',
			isCustom: true,
			author: 'You',
			selectedFields: ['name', 'email', 'phone', 'single-line', 'multi-line', 'number-basic'],
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
				}
			],
			createdAt: '2024-01-25T00:00:00Z',
			updatedAt: '2024-01-25T00:00:00Z'
		};

		// Available basic field types (same as in creation page)
		const basicFieldTypes = [
			{
				category: 'Grid',
				isNew: true,
				fields: [
					{ id: 'grid-1-column', name: '1-Column', type: 'grid', icon: 'material-symbols:view-column', description: 'Single column layout' },
					{ id: 'grid-2-column', name: '2-Column', type: 'grid', icon: 'material-symbols:view-column', description: 'Two column layout' },
					{ id: 'grid-3-column', name: '3-Column', type: 'grid', icon: 'material-symbols:view-column', description: 'Three column layout' }
				]
			},
			{
				category: 'Basic Info',
				isNew: false,
				fields: [
					{ id: 'name', name: 'Name', type: 'text', icon: 'material-symbols:person', description: 'Full name input field' },
					{ id: 'address', name: 'Address', type: 'address', icon: 'material-symbols:location-on', description: 'Complete address with validation' },
					{ id: 'phone', name: 'Phone', type: 'tel', icon: 'material-symbols:phone', description: 'Phone number with formatting' },
					{ id: 'email', name: 'Email', type: 'email', icon: 'material-symbols:email', description: 'Email address with validation' },
					{ id: 'website', name: 'Website', type: 'url', icon: 'material-symbols:language', description: 'Website URL input' }
				]
			},
			{
				category: 'Textbox',
				isNew: false,
				fields: [
					{ id: 'single-line', name: 'Single Line', type: 'text', icon: 'material-symbols:text-fields', description: 'Single line text input' },
					{ id: 'multi-line', name: 'Multi Line', type: 'textarea', icon: 'material-symbols:notes', description: 'Multi-line text area' }
				]
			},
			{
				category: 'Number',
				isNew: false,
				fields: [
					{ id: 'number-basic', name: 'Number', type: 'number', icon: 'material-symbols:numbers', description: 'Basic number input' },
					{ id: 'decimal', name: 'Decimal', type: 'number', icon: 'material-symbols:decimal-increase', description: 'Decimal number input' },
					{ id: 'currency', name: 'Currency', type: 'number', icon: 'material-symbols:attach-money', description: 'Currency amount input' }
				]
			}
		];

		return {
			userId,
			fieldSetId,
			fieldSet: mockCustomFieldSet,
			basicFieldTypes
		};

	} catch (err) {
		console.error('Custom field set load error:', err);
		throw error(404, 'Custom field set not found');
	}
};
