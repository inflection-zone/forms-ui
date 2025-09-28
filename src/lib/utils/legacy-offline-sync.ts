import { browser } from '$app/environment';
import { IndexedDB } from './indexedDB';

export interface LegacyOfflineSubmission {
	id: string;
	formId: string;
	formName: string;
	submissionData: any;
	submissionTimestamp: string;
	formType: 'regular' | 'offline';
	pageUrl: string;
}

export class LegacyOfflineSyncManager {
	private indexedDB: IndexedDB<{ id: string; payload: any }>;

	constructor() {
		this.indexedDB = new IndexedDB('form-submissions', 'unsaved_answers');
	}

	/**
	 * Get all pending submissions from the original IndexedDB
	 */
	async getAllPendingSubmissions(): Promise<LegacyOfflineSubmission[]> {
		if (!browser) return [];

		try {
			const allData = await this.indexedDB.getAll();
			const pendingSubmissions: LegacyOfflineSubmission[] = [];

			// Find all submissions with intentToSubmit
			for (const item of allData) {
				if (item.payload?.intentToSubmit && item.id.startsWith('Submission_')) {
					const formId = item.id.replace('Submission_', '');
					
					pendingSubmissions.push({
						id: item.id,
						formId: formId,
						formName: `Form ${formId}`,
						submissionData: item.payload.FormData,
						submissionTimestamp: item.payload.submissionTimestamp || new Date().toISOString(),
						formType: item.payload.Token ? 'regular' : 'offline',
						pageUrl: window.location.href
					});
				}
			}

			return pendingSubmissions;
		} catch (error) {
			console.error('Failed to get pending submissions:', error);
			return [];
		}
	}

	/**
	 * Sync a single legacy submission
	 */
	async syncLegacySubmission(submission: LegacyOfflineSubmission): Promise<boolean> {
		if (!browser) return false;

		try {
			console.log(`🔄 Syncing legacy submission: ${submission.id}`);

			if (submission.formType === 'regular') {
				return await this.syncRegularFormSubmission(submission);
			} else {
				return await this.syncOfflineFormSubmission(submission);
			}
		} catch (error) {
			console.error(`❌ Failed to sync legacy submission ${submission.id}:`, error);
			return false;
		}
	}

	/**
	 * Sync regular form submission
	 */
	private async syncRegularFormSubmission(submission: LegacyOfflineSubmission): Promise<boolean> {
		try {
			// Get the stored submission data to access FormSubmissionId and FormTemplateId
			const storedData = await this.getStoredSubmissionData(submission.id);
			if (!storedData) {
				throw new Error('Could not retrieve stored submission data');
			}

			const { FormSubmissionId, FormTemplateId } = storedData;

		// Convert FormData to QuestionResponses format
		const questionResponses = this.convertFormDataToQuestionResponses(
			submission.submissionData,
			FormSubmissionId,
			FormTemplateId
		);

		const questionResponseRes = await fetch('/api/server/question-response', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				QuestionResponses: questionResponses,
				FormSubmissionKey: submission.formId
			})
		});

			if (!questionResponseRes.ok) {
				const errorText = await questionResponseRes.text();
				throw new Error(`Question response save failed: ${questionResponseRes.status} - ${errorText}`);
			}

			const questionResponseResult = await questionResponseRes.json();
			console.log('Question response save result:', questionResponseResult);

			// Submit the form
			const submitRes = await fetch('/api/server/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					submissionKey: submission.formId,
					FormData: submission.submissionData,
					submissionTimestamp: submission.submissionTimestamp
				})
			});

			if (!submitRes.ok) {
				const errorText = await submitRes.text();
				throw new Error(`Form submission failed: ${submitRes.status} - ${errorText}`);
			}

			const result = await submitRes.json();
			console.log('Form submission result:', result);

			if (result.message) {
				throw new Error(`Server error: ${result.message}`);
			}

			// Remove the submission from IndexedDB after successful sync
			await this.indexedDB.delete(submission.id);
			console.log(`✅ Successfully synced legacy submission: ${submission.id}`);
			return true;

		} catch (error) {
			console.error(`❌ Failed to sync regular form submission ${submission.id}:`, error);
			return false;
		}
	}

	/**
	 * Sync offline form submission
	 */
	private async syncOfflineFormSubmission(submission: LegacyOfflineSubmission): Promise<boolean> {
		try {
			// Get the stored submission data to access FormTemplateId
			const storedData = await this.getStoredSubmissionData(submission.id);
			if (!storedData) {
				throw new Error('Could not retrieve stored submission data');
			}

			const { FormTemplateId } = storedData;

			// First create a submission for offline forms
			const createSubmissionRes = await fetch('/api/server/submission', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					FormTemplateId: FormTemplateId
				})
			});

			if (!createSubmissionRes.ok) {
				const errorText = await createSubmissionRes.text();
				throw new Error(`Create submission failed: ${createSubmissionRes.status} - ${errorText}`);
			}

			const createSubmissionData = await createSubmissionRes.json();
			console.log('Create submission result:', createSubmissionData);

			if (createSubmissionData.Status !== 'success' || !createSubmissionData.Data?.id) {
				throw new Error('Failed to create submission');
			}

			const submissionId = createSubmissionData.Data.id;
			const encryptedKey = createSubmissionData.Data.Encrypted;

		// Convert FormData to QuestionResponses format
		const questionResponses = this.convertFormDataToQuestionResponses(
			submission.submissionData,
			submissionId,
			FormTemplateId
		);

		// Save question responses
		const questionResponseRes = await fetch('/api/server/question-response', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				QuestionResponses: questionResponses,
				FormSubmissionKey: encryptedKey
			})
		});

			if (!questionResponseRes.ok) {
				const errorText = await questionResponseRes.text();
				throw new Error(`Question response save failed: ${questionResponseRes.status} - ${errorText}`);
			}

			const questionResponseResult = await questionResponseRes.json();
			console.log('Question response save result:', questionResponseResult);

			// Submit the form
			const submitRes = await fetch('/api/server/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					submissionKey: encryptedKey,
					FormData: submission.submissionData,
					submissionTimestamp: submission.submissionTimestamp
				})
			});

			if (!submitRes.ok) {
				const errorText = await submitRes.text();
				throw new Error(`Form submission failed: ${submitRes.status} - ${errorText}`);
			}

			const result = await submitRes.json();
			console.log('Form submission result:', result);

			if (result.message) {
				throw new Error(`Server error: ${result.message}`);
			}

			// Remove the submission from IndexedDB after successful sync
			await this.indexedDB.delete(submission.id);
			console.log(`✅ Successfully synced legacy offline submission: ${submission.id}`);
			return true;

		} catch (error) {
			console.error(`❌ Failed to sync offline form submission ${submission.id}:`, error);
			return false;
		}
	}

	/**
	 * Sync all pending legacy submissions
	 */
	async syncAllPendingSubmissions(): Promise<{ success: number; failed: number }> {
		if (!browser) {
			console.log('❌ Not in browser environment, skipping sync');
			return { success: 0, failed: 0 };
		}

		console.log('🔄 Starting sync of all legacy pending submissions...');

		try {
			const pendingSubmissions = await this.getAllPendingSubmissions();
			console.log(`📋 Found ${pendingSubmissions.length} legacy pending submissions to sync`);

			if (pendingSubmissions.length === 0) {
				console.log('ℹ️ No pending submissions found');
				return { success: 0, failed: 0 };
			}

			// Log all pending submissions for debugging
			pendingSubmissions.forEach((submission, index) => {
				console.log(`\n--- Pending Submission ${index + 1} ---`);
				console.log(`ID: ${submission.id}`);
				console.log(`Form ID: ${submission.formId}`);
				console.log(`Form Type: ${submission.formType}`);
				console.log(`Submission Data:`, submission.submissionData);
			});

			let successCount = 0;
			let failCount = 0;

			// Process submissions sequentially
			for (const submission of pendingSubmissions) {
				try {
					console.log(`\n🔄 Processing submission: ${submission.id}`);
					const success = await this.syncLegacySubmission(submission);
					if (success) {
						successCount++;
						console.log(`✅ Successfully synced: ${submission.id}`);
					} else {
						failCount++;
						console.log(`❌ Failed to sync: ${submission.id}`);
					}
				} catch (error) {
					console.error(`❌ Error syncing submission ${submission.id}:`, error);
					failCount++;
				}

				// Small delay between submissions
				await new Promise(resolve => setTimeout(resolve, 500));
			}

			console.log(`🎉 Legacy sync completed: ${successCount} successful, ${failCount} failed`);
			return { success: successCount, failed: failCount };

		} catch (error) {
			console.error('❌ Legacy sync process failed:', error);
			return { success: 0, failed: 0 };
		}
	}

	/**
	 * Convert FormData to QuestionResponses format expected by backend
	 */
	private convertFormDataToQuestionResponses(
		formData: any,
		formSubmissionId: string,
		formTemplateId: string
	): any[] {
		if (!formData || typeof formData !== 'object') {
			return [];
		}

		return Object.entries(formData)
			.filter(([, value]) => value !== null && value !== undefined && value !== '')
			.map(([fieldId, value]) => ({
				FormSubmissionId: formSubmissionId,
				FormFieldId: fieldId,
				FormTemplateId: formTemplateId,
				ResponseType: 'Text',
				IntegerValue: typeof value === 'number' && Number.isInteger(value) ? value : null,
				FloatValue: typeof value === 'number' && !Number.isInteger(value) ? value : null,
				BooleanValue: typeof value === 'boolean' ? String(value) : null,
				DateTimeValue: null,
				Url: null,
				TextValue: typeof value !== 'number' && typeof value !== 'boolean' ? String(value) : null,
				FileResourceId: null
			}));
	}

	/**
	 * Get stored submission data by ID
	 */
	private async getStoredSubmissionData(submissionId: string): Promise<any> {
		try {
			const allData = await this.indexedDB.getAll();
			const submission = allData.find(item => item.id === submissionId);
			return submission?.payload || null;
		} catch (error) {
			console.error('Failed to get stored submission data:', error);
			return null;
		}
	}

	/**
	 * Clear all legacy submissions
	 */
	async clearAllLegacySubmissions(): Promise<void> {
		if (!browser) return;

		try {
			const allData = await this.indexedDB.getAll();
			const submissionKeys = allData
				.filter(item => item.id.startsWith('Submission_'))
				.map(item => item.id);

			for (const key of submissionKeys) {
				await this.indexedDB.delete(key);
			}

			console.log(`✅ Cleared ${submissionKeys.length} legacy submissions`);
		} catch (error) {
			console.error('Failed to clear legacy submissions:', error);
		}
	}
}

// Export singleton instance
export const legacyOfflineSyncManager = new LegacyOfflineSyncManager();
