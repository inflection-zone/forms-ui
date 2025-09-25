/**
 * Export utility functions for different file formats
 */

export interface ExportOptions {
	includeMetadata?: boolean;
	includeResponses?: boolean;
	fileName?: string;
}

export interface TemplateData {
	id: string;
	Title: string;
	Description?: string;
	Type?: string;
	CurrentVersion?: number;
	CreatedAt?: string;
	UpdatedAt?: string;
	Data?: any;
	[key: string]: any;
}

/**
 * Convert template data to JSON format
 */
export function exportToJSON(templates: TemplateData[], options: ExportOptions = {}): string {
	const exportData = {
		metadata: {
			exportedAt: new Date().toISOString(),
			templateCount: templates.length,
			exportOptions: options
		},
		templates: templates.map(template => {
			const baseTemplate = {
				id: template.id,
				Title: template.Title,
				Description: template.Description,
				Type: template.Type,
				CurrentVersion: template.CurrentVersion
			};

			if (options.includeMetadata) {
				Object.assign(baseTemplate, {
					CreatedAt: template.CreatedAt,
					UpdatedAt: template.UpdatedAt
				});
			}

			if (options.includeResponses && template.Data) {
				Object.assign(baseTemplate, {
					Data: template.Data
				});
			}

			return baseTemplate;
		})
	};

	return JSON.stringify(exportData, null, 2);
}

/**
 * Convert template data to CSV format
 */
export function exportToCSV(templates: TemplateData[], options: ExportOptions = {}): string {
	if (templates.length === 0) return '';

	// Define CSV headers based on options
	const headers = ['ID', 'Title', 'Description', 'Type', 'Current Version'];
	
	if (options.includeMetadata) {
		headers.push('Created At', 'Updated At');
	}

	const csvRows = [headers.join(',')];

	templates.forEach(template => {
		const values = [
			escapeCSVValue(template.id),
			escapeCSVValue(template.Title || ''),
			escapeCSVValue(template.Description || ''),
			escapeCSVValue(template.Type || ''),
			escapeCSVValue(template.CurrentVersion?.toString() || '')
		];

		if (options.includeMetadata) {
			values.push(
				escapeCSVValue(template.CreatedAt || ''),
				escapeCSVValue(template.UpdatedAt || '')
			);
		}

		csvRows.push(values.join(','));
	});

	return csvRows.join('\n');
}

/**
 * Generate PDF content (placeholder - would need PDF generation library)
 */
export function exportToPDF(templates: TemplateData[], options: ExportOptions = {}): string {
	// This is a placeholder implementation
	// In a real implementation, you would use a library like jsPDF or Puppeteer
	const content = templates.map(template => {
		return `
Template: ${template.Title}
ID: ${template.id}
Type: ${template.Type || 'N/A'}
Version: ${template.CurrentVersion || '1'}
${template.Description ? `Description: ${template.Description}` : ''}
${options.includeMetadata && template.CreatedAt ? `Created: ${template.CreatedAt}` : ''}
---
		`.trim();
	}).join('\n\n');

	return content;
}

/**
 * Generate ZIP archive content (placeholder - would need ZIP library)
 */
export function exportToZIP(templates: TemplateData[], options: ExportOptions = {}): string {
	// This is a placeholder implementation
	// In a real implementation, you would use a library like JSZip
	const archiveContent = {
		'export-info.json': JSON.stringify({
			exportedAt: new Date().toISOString(),
			templateCount: templates.length,
			exportOptions: options
		}, null, 2),
		'templates.json': exportToJSON(templates, options),
		'templates.csv': exportToCSV(templates, options)
	};

	return JSON.stringify(archiveContent, null, 2);
}

/**
 * Escape CSV values to handle commas, quotes, and newlines
 */
function escapeCSVValue(value: string): string {
	if (typeof value !== 'string') {
		value = String(value);
	}

	// If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
	if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
		return `"${value.replace(/"/g, '""')}"`;
	}

	return value;
}

/**
 * Generate filename based on format and options
 */
export function generateFileName(format: string, options: ExportOptions = {}): string {
	const timestamp = new Date().toISOString().split('T')[0];
	const baseName = options.fileName || `form-templates-export-${timestamp}`;
	
	const extensions = {
		json: 'json',
		csv: 'csv',
		pdf: 'pdf',
		zip: 'zip'
	};

	const extension = extensions[format as keyof typeof extensions] || 'txt';
	return `${baseName}.${extension}`;
}

/**
 * Download file with given content and filename
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	window.URL.revokeObjectURL(url);
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: string): string {
	const mimeTypes = {
		json: 'application/json',
		csv: 'text/csv',
		pdf: 'application/pdf',
		zip: 'application/zip'
	};

	return mimeTypes[format as keyof typeof mimeTypes] || 'text/plain';
}
