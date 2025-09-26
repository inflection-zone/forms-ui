import { browser } from '$app/environment';
import { offlineSubmissionQueue } from './offline-submission-queue';
import { offlineSyncManager } from './offline-sync-manager';
import { legacyOfflineSyncManager } from './legacy-offline-sync';

/**
 * Console utilities for offline submission management
 * These functions are exposed to the browser console for easy debugging and data access
 */

if (browser) {
	// Expose offline submission manager to global scope for console access
	(window as any).offlineSubmissions = {
		// Get all submissions
		getAll: () => offlineSubmissionQueue.getAllSubmissions(),
		
		// Get pending submissions
		getPending: () => offlineSubmissionQueue.getPendingSubmissions(),
		
		// Get statistics
		getStats: () => offlineSubmissionQueue.getStatistics(),
		
		// Remove a submission
		remove: (submissionId: string) => offlineSubmissionQueue.removeSubmission(submissionId),
		
		// Clear all submissions
		clearAll: () => offlineSubmissionQueue.clearAllSubmissions(),
		
		// Update submission status
		updateStatus: (submissionId: string, status: 'pending' | 'submitted' | 'failed') => 
			offlineSubmissionQueue.updateSubmissionStatus(submissionId, status),
		
		// Manually trigger sync
		sync: () => offlineSyncManager.triggerSync(),
		
		// Check if currently syncing
		isSyncing: () => offlineSyncManager.isCurrentlySyncing(),
		
		// Subscribe to sync events
		onSyncComplete: (callback: (success: boolean, count: number) => void) => 
			offlineSyncManager.onSyncComplete(callback),
		
		// Helper to find submissions by form name
		findByFormName: async (formName: string) => {
			const all = await offlineSubmissionQueue.getAllSubmissions();
			return all.filter(s => s.formName.toLowerCase().includes(formName.toLowerCase()));
		},
		
		// Helper to find submissions by form ID
		findByFormId: async (formId: string) => {
			const all = await offlineSubmissionQueue.getAllSubmissions();
			return all.filter(s => s.formId === formId);
		},
		
		// Helper to find submissions by date range
		findByDateRange: async (startDate: string, endDate: string) => {
			const all = await offlineSubmissionQueue.getAllSubmissions();
			const start = new Date(startDate);
			const end = new Date(endDate);
			return all.filter(s => {
				const date = new Date(s.submissionTimestamp);
				return date >= start && date <= end;
			});
		},
		
		// Helper to export all submissions as JSON
		exportAsJSON: async () => {
			const all = await offlineSubmissionQueue.getAllSubmissions();
			const dataStr = JSON.stringify(all, null, 2);
			const dataBlob = new Blob([dataStr], { type: 'application/json' });
			const url = URL.createObjectURL(dataBlob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `offline-submissions-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		},
		
		// Helper to log all submissions to console
		logAll: async () => {
			const all = await offlineSubmissionQueue.getAllSubmissions();
			console.log('=== OFFLINE FORM SUBMISSIONS ===');
			console.log(`Total submissions: ${all.length}`);
			
			if (all.length === 0) {
				console.log('No offline submissions found.');
				return;
			}

			all.forEach((submission, index) => {
				console.log(`\n--- Submission ${index + 1} ---`);
				console.log(`ID: ${submission.id}`);
				console.log(`Form: ${submission.formName} (${submission.formId})`);
				console.log(`Type: ${submission.formType}`);
				console.log(`Status: ${submission.status}`);
				console.log(`Date: ${new Date(submission.submissionTimestamp).toLocaleString()}`);
				console.log(`URL: ${submission.pageUrl}`);
				console.log(`Data:`, submission.submissionData);
			});
			
			console.log('=== END OF SUBMISSIONS ===');
		},

		// Legacy submission management
		legacy: {
			// Get all legacy pending submissions
			getPending: () => legacyOfflineSyncManager.getAllPendingSubmissions(),
			
			// Sync all legacy submissions
			syncAll: () => legacyOfflineSyncManager.syncAllPendingSubmissions(),
			
			// Clear all legacy submissions
			clearAll: () => legacyOfflineSyncManager.clearAllLegacySubmissions(),
			
			// Log all legacy submissions
			logAll: async () => {
				const all = await legacyOfflineSyncManager.getAllPendingSubmissions();
				console.log('=== LEGACY OFFLINE SUBMISSIONS ===');
				console.log(`Total legacy submissions: ${all.length}`);
				
				if (all.length === 0) {
					console.log('No legacy offline submissions found.');
					return;
				}

				all.forEach((submission, index) => {
					console.log(`\n--- Legacy Submission ${index + 1} ---`);
					console.log(`ID: ${submission.id}`);
					console.log(`Form: ${submission.formName} (${submission.formId})`);
					console.log(`Type: ${submission.formType}`);
					console.log(`Date: ${new Date(submission.submissionTimestamp).toLocaleString()}`);
					console.log(`URL: ${submission.pageUrl}`);
					console.log(`Data:`, submission.submissionData);
				});
				
				console.log('=== END OF LEGACY SUBMISSIONS ===');
			}
		}
	};

	// Add some helpful console messages
	console.log('🔧 Offline Submissions Manager loaded!');
	console.log('📋 Available commands:');
	console.log('  - offlineSubmissions.getAll() - Get all submissions');
	console.log('  - offlineSubmissions.getPending() - Get pending submissions');
	console.log('  - offlineSubmissions.getStats() - Get statistics');
	console.log('  - offlineSubmissions.logAll() - Log all submissions to console');
	console.log('  - offlineSubmissions.exportAsJSON() - Export as JSON file');
	console.log('  - offlineSubmissions.findByFormName("name") - Find by form name');
	console.log('  - offlineSubmissions.findByFormId("id") - Find by form ID');
	console.log('  - offlineSubmissions.findByDateRange("2024-01-01", "2024-12-31") - Find by date range');
	console.log('  - offlineSubmissions.sync() - Manually trigger sync');
	console.log('  - offlineSubmissions.isSyncing() - Check if currently syncing');
	console.log('  - offlineSubmissions.onSyncComplete(callback) - Subscribe to sync events');
	console.log('  - offlineSubmissions.remove(id) - Remove a submission');
	console.log('  - offlineSubmissions.clearAll() - Clear all submissions');
	console.log('  - offlineSubmissions.updateStatus(id, "status") - Update submission status');
	console.log('');
	console.log('📋 Legacy submission commands:');
	console.log('  - offlineSubmissions.legacy.getPending() - Get legacy pending submissions');
	console.log('  - offlineSubmissions.legacy.syncAll() - Sync all legacy submissions');
	console.log('  - offlineSubmissions.legacy.clearAll() - Clear all legacy submissions');
	console.log('  - offlineSubmissions.legacy.logAll() - Log all legacy submissions');
}
