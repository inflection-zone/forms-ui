import { browser } from '$app/environment';
import { offlineSubmissionQueue, type OfflineSubmission } from './offline-submission-queue';

export class OfflineSyncManager {
	private static instance: OfflineSyncManager;
	private isSyncing = false;
	private syncCallbacks: ((success: boolean, count: number) => void)[] = [];

	private constructor() {
		if (browser) {
			this.setupOnlineListener();
		}
	}

	public static getInstance(): OfflineSyncManager {
		if (!OfflineSyncManager.instance) {
			OfflineSyncManager.instance = new OfflineSyncManager();
		}
		return OfflineSyncManager.instance;
	}

	/**
	 * Set up online event listener
	 */
	private setupOnlineListener(): void {
		if (!browser) return;

		window.addEventListener('online', () => {
			console.log('🌐 Back online - starting sync process...');
			this.syncAllPendingSubmissions();
		});
	}

	/**
	 * Sync all pending submissions
	 */
	async syncAllPendingSubmissions(): Promise<void> {
		if (!browser || this.isSyncing) return;

		this.isSyncing = true;
		console.log('🔄 Starting sync of all pending submissions...');

		try {
			const pendingSubmissions = await offlineSubmissionQueue.getPendingSubmissions();
			console.log(`📋 Found ${pendingSubmissions.length} pending submissions to sync`);

			if (pendingSubmissions.length === 0) {
				this.notifyCallbacks(true, 0);
				return;
			}

			let successCount = 0;
			let failCount = 0;

			// Process submissions sequentially to avoid overwhelming the server
			for (const submission of pendingSubmissions) {
				try {
					console.log(`🔄 Syncing submission: ${submission.id}`);
					await this.syncSingleSubmission(submission);
					successCount++;
					console.log(`✅ Successfully synced: ${submission.id}`);
				} catch (error) {
					console.error(`❌ Failed to sync submission ${submission.id}:`, error);
					await offlineSubmissionQueue.updateSubmissionStatus(submission.id, 'failed');
					failCount++;
				}

				// Small delay between submissions to avoid overwhelming the server
				await new Promise(resolve => setTimeout(resolve, 500));
			}

			console.log(`🎉 Sync completed: ${successCount} successful, ${failCount} failed`);
			this.notifyCallbacks(failCount === 0, successCount);

		} catch (error) {
			console.error('❌ Sync process failed:', error);
			this.notifyCallbacks(false, 0);
		} finally {
			this.isSyncing = false;
		}
	}

	/**
	 * Sync a single submission
	 */
	private async syncSingleSubmission(submission: OfflineSubmission): Promise<void> {
		if (submission.formType === 'regular') {
			await this.syncRegularFormSubmission(submission);
		} else {
			await this.syncOfflineFormSubmission(submission);
		}
	}

	/**
	 * Sync regular form submission
	 */
	private async syncRegularFormSubmission(submission: OfflineSubmission): Promise<void> {
		// For regular forms, we need to:
		// 1. Save question responses
		// 2. Submit the form

		// First, try to save question responses
		const questionResponseRes = await fetch('/api/server/question-response', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				questionResponses: [], // This would need to be constructed from submission data
				formSubmissionKey: submission.formId,
				FormData: submission.submissionData
			})
		});

		if (!questionResponseRes.ok) {
			throw new Error(`Question response save failed: ${questionResponseRes.status}`);
		}

		// Then submit the form
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
			throw new Error(`Form submission failed: ${submitRes.status}`);
		}

		const result = await submitRes.json();
		if (result.message) {
			throw new Error(`Server error: ${result.message}`);
		}

		// Mark as submitted
		await offlineSubmissionQueue.updateSubmissionStatus(submission.id, 'submitted');
	}

	/**
	 * Sync offline form submission
	 */
	private async syncOfflineFormSubmission(submission: OfflineSubmission): Promise<void> {
		// For offline forms, we need to:
		// 1. Create a submission
		// 2. Save question responses
		// 3. Submit the form

		// First create a submission
		const createSubmissionRes = await fetch('/api/server/submission', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				FormTemplateId: submission.formId
			})
		});

		if (!createSubmissionRes.ok) {
			throw new Error(`Create submission failed: ${createSubmissionRes.status}`);
		}

		const createSubmissionData = await createSubmissionRes.json();
		if (createSubmissionData.Status !== 'success' || !createSubmissionData.Data?.id) {
			throw new Error('Failed to create submission');
		}

		const submissionId = createSubmissionData.Data.id;
		const encryptedKey = createSubmissionData.Data.Encrypted;

		// Save question responses
		const questionResponseRes = await fetch('/api/server/question-response', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				questionResponses: [], // This would need to be constructed from submission data
				formSubmissionKey: encryptedKey,
				FormData: submission.submissionData
			})
		});

		if (!questionResponseRes.ok) {
			throw new Error(`Question response save failed: ${questionResponseRes.status}`);
		}

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
			throw new Error(`Form submission failed: ${submitRes.status}`);
		}

		const result = await submitRes.json();
		if (result.message) {
			throw new Error(`Server error: ${result.message}`);
		}

		// Mark as submitted
		await offlineSubmissionQueue.updateSubmissionStatus(submission.id, 'submitted');
	}

	/**
	 * Subscribe to sync events
	 */
	onSyncComplete(callback: (success: boolean, count: number) => void): () => void {
		this.syncCallbacks.push(callback);
		return () => {
			const index = this.syncCallbacks.indexOf(callback);
			if (index > -1) {
				this.syncCallbacks.splice(index, 1);
			}
		};
	}

	/**
	 * Notify all callbacks
	 */
	private notifyCallbacks(success: boolean, count: number): void {
		this.syncCallbacks.forEach(callback => {
			try {
				callback(success, count);
			} catch (error) {
				console.error('Error in sync callback:', error);
			}
		});
	}

	/**
	 * Manually trigger sync
	 */
	async triggerSync(): Promise<void> {
		if (navigator.onLine) {
			await this.syncAllPendingSubmissions();
		} else {
			console.log('❌ Cannot sync - currently offline');
		}
	}

	/**
	 * Get sync status
	 */
	isCurrentlySyncing(): boolean {
		return this.isSyncing;
	}
}

// Export singleton instance
export const offlineSyncManager = OfflineSyncManager.getInstance();
