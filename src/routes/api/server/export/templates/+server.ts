import { json, type RequestHandler } from '@sveltejs/kit';
import { getFormTemplateById, getFormTemplateDetails } from '../../../services/form-template';
import { BACKEND_API_URL } from '$env/static/private';

interface ExportRequest {
	templateIds: string[];
	format: 'json' | 'pdf' | 'csv' | 'zip';
	includeResponses?: boolean;
	includeMetadata?: boolean;
	fileName?: string;
}

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		const body: ExportRequest = await request.json();
		const { templateIds, format, includeResponses = false, includeMetadata = true, fileName } = body;

		if (!templateIds || templateIds.length === 0) {
			return json({ error: 'No template IDs provided' }, { status: 400 });
		}

		// Fetch template data
		const templates = [];
		for (const templateId of templateIds) {
			try {
				const templateDetails = await getFormTemplateDetails(templateId);
				if (templateDetails && templateDetails.HttpCode === 200) {
					templates.push(templateDetails.Data);
				}
			} catch (error) {
				console.error(`Error fetching template ${templateId}:`, error);
			}
		}

		if (templates.length === 0) {
			return json({ error: 'No valid templates found' }, { status: 404 });
		}

		// Process export based on format
		let exportData;
		let mimeType;
		let fileExtension;

		switch (format) {
			case 'json':
				exportData = JSON.stringify(templates, null, 2);
				mimeType = 'application/json';
				fileExtension = 'json';
				break;

			case 'csv':
				exportData = convertToCSV(templates);
				mimeType = 'text/csv';
				fileExtension = 'csv';
				break;

			case 'pdf':
				// For PDF, we'll return JSON for now - PDF generation would require additional libraries
				exportData = JSON.stringify(templates, null, 2);
				mimeType = 'application/json';
				fileExtension = 'json';
				break;

			case 'zip':
				// For ZIP, we'll return JSON for now - ZIP generation would require additional libraries
				exportData = JSON.stringify(templates, null, 2);
				mimeType = 'application/json';
				fileExtension = 'json';
				break;

			default:
				return json({ error: 'Unsupported export format' }, { status: 400 });
		}

		const finalFileName = fileName || `form-templates-export-${new Date().toISOString().split('T')[0]}.${fileExtension}`;

		return new Response(exportData, {
			status: 200,
			headers: {
				'Content-Type': mimeType,
				'Content-Disposition': `attachment; filename="${finalFileName}"`,
				'Cache-Control': 'no-cache'
			}
		});

	} catch (error) {
		console.error('Export error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

function convertToCSV(templates: any[]): string {
	if (templates.length === 0) return '';

	// Get all unique keys from all templates
	const allKeys = new Set<string>();
	templates.forEach(template => {
		Object.keys(template).forEach(key => allKeys.add(key));
	});

	const headers = Array.from(allKeys);
	const csvRows = [headers.join(',')];

	templates.forEach(template => {
		const values = headers.map(header => {
			const value = template[header];
			// Escape CSV values
			if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
				return `"${value.replace(/"/g, '""')}"`;
			}
			return value || '';
		});
		csvRows.push(values.join(','));
	});

	return csvRows.join('\n');
}
