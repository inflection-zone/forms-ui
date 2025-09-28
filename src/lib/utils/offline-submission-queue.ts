import { browser } from '$app/environment';
import { IndexedDB } from './indexedDB';

export interface OfflineSubmission {
	id: string;
	formId: string;
	formName: string;
	submissionData: any;
	submissionTimestamp: string;
	formType: 'regular' | 'offline';
	pageUrl: string;
	status: 'pending' | 'submitted' | 'failed';
}

export interface OfflineSubmissionQueue {
	id: string;
	submissions: OfflineSubmission[];
	lastUpdated: string;
}

export class OfflineSubmissionQueueManager {
	private indexedDB: IndexedDB<OfflineSubmissionQueue>;
	private readonly DB_NAME = 'offline-submission-queue';
	private readonly STORE_NAME = 'submissions';
	private readonly QUEUE_KEY = 'offline_submission_queue';

	constructor() {
		this.indexedDB = new IndexedDB(this.DB_NAME, this.STORE_NAME);
	}

	/**
	 * Add a new offline submission to the queue
	 */
	async addSubmission(submission: Omit<OfflineSubmission, 'id' | 'status'>): Promise<string> {
		if (!browser) return '';

		const submissionId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const fullSubmission: OfflineSubmission = {
			...submission,
			id: submissionId,
			status: 'pending'
		};

		try {
			const queue = await this.getQueue();
			queue.submissions.push(fullSubmission);
			queue.lastUpdated = new Date().toISOString();

			await this.indexedDB.add(queue);
			console.log(`✅ Added offline submission: ${submissionId}`);
			return submissionId;
		} catch (error) {
			console.error('Failed to add offline submission:', error);
			throw error;
		}
	}

	/**
	 * Get all pending submissions
	 */
	async getPendingSubmissions(): Promise<OfflineSubmission[]> {
		if (!browser) return [];

		try {
			const queue = await this.getQueue();
			return queue.submissions.filter(s => s.status === 'pending');
		} catch (error) {
			console.error('Failed to get pending submissions:', error);
			return [];
		}
	}

	/**
	 * Get all submissions
	 */
	async getAllSubmissions(): Promise<OfflineSubmission[]> {
		if (!browser) return [];

		try {
			const queue = await this.getQueue();
			return queue.submissions;
		} catch (error) {
			console.error('Failed to get all submissions:', error);
			return [];
		}
	}

	/**
	 * Update submission status
	 */
	async updateSubmissionStatus(submissionId: string, status: OfflineSubmission['status']): Promise<void> {
		if (!browser) return;

		try {
			const queue = await this.getQueue();
			const submission = queue.submissions.find(s => s.id === submissionId);
			if (submission) {
				submission.status = status;
				queue.lastUpdated = new Date().toISOString();
				await this.indexedDB.add(queue);
				console.log(`✅ Updated submission ${submissionId} status to ${status}`);
			}
		} catch (error) {
			console.error('Failed to update submission status:', error);
		}
	}

	/**
	 * Remove a submission from the queue
	 */
	async removeSubmission(submissionId: string): Promise<void> {
		if (!browser) return;

		try {
			const queue = await this.getQueue();
			queue.submissions = queue.submissions.filter(s => s.id !== submissionId);
			queue.lastUpdated = new Date().toISOString();
			await this.indexedDB.add(queue);
			console.log(`✅ Removed submission: ${submissionId}`);
		} catch (error) {
			console.error('Failed to remove submission:', error);
		}
	}

	/**
	 * Clear all submissions
	 */
	async clearAllSubmissions(): Promise<void> {
		if (!browser) return;

		try {
			await this.indexedDB.add({
				id: this.QUEUE_KEY,
				submissions: [],
				lastUpdated: new Date().toISOString()
			});
			console.log('✅ Cleared all offline submissions');
		} catch (error) {
			console.error('Failed to clear submissions:', error);
		}
	}

	/**
	 * Get submission statistics
	 */
	async getStatistics(): Promise<{
		total: number;
		pending: number;
		submitted: number;
		failed: number;
	}> {
		const submissions = await this.getAllSubmissions();
		return {
			total: submissions.length,
			pending: submissions.filter(s => s.status === 'pending').length,
			submitted: submissions.filter(s => s.status === 'submitted').length,
			failed: submissions.filter(s => s.status === 'failed').length
		};
	}

	/**
	 * Get the submission queue
	 */
	private async getQueue(): Promise<OfflineSubmissionQueue> {
		const allData = await this.indexedDB.getAll();
		const existingQueue = allData.find(item => item.id === this.QUEUE_KEY);
		
		if (existingQueue) {
			return existingQueue;
		}

		// Return empty queue if none exists
		return {
			id: this.QUEUE_KEY,
			submissions: [],
			lastUpdated: new Date().toISOString()
		};
	}
}

// Export singleton instance
export const offlineSubmissionQueue = new OfflineSubmissionQueueManager();
