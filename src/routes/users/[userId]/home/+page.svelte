<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const userId = page.params.userId;

	// Helper function to format numbers
	function formatNumber(num: number): string {
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	}

	// Helper function to format date
	function formatDate(dateString: string): string {
		if (!dateString) return 'Unknown';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return 'Unknown';
		
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		if (diffDays === 1) return '1 day ago';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
		return date.toLocaleDateString();
	}

	// Navigation functions
	function navigateToTemplates() {
		window.location.href = `/users/${userId}/form-templates`;
	}

	function navigateToNewTemplate() {
		window.location.href = `/users/${userId}/form-templates/new`;
	}

	function navigateToSubmissions() {
		window.location.href = `/users/${userId}/submissions`;
	}

	function navigateToFieldLibrary() {
		window.location.href = `/users/${userId}/field-library`;
	}

	function navigateToAnalytics() {
		window.location.href = `/users/${userId}/analytics`;
	}
</script>

<svelte:head>
	<title>Dashboard - Form Builder</title>
</svelte:head>

<div class="w-full bg-gray-50 dark:bg-gray-900">
	<!-- Header Section -->
	<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
						Welcome back, {data.user.name}!
					</h1>
					<p class="text-gray-600 dark:text-gray-400 mt-1">
						Ready to build something amazing?
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Quick Actions Section -->
		<div class="mb-8">
			<div class="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-4">Get started with these common tasks</p>
				
				<div class="flex flex-wrap gap-3">
					<button 
						onclick={navigateToNewTemplate}
						class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
					>
						<Icon icon="material-symbols:add" class="mr-2" width="20" height="20" />
						Create Form Template
					</button>
					
					<button 
						onclick={navigateToTemplates}
						class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
					>
						<Icon icon="material-symbols:dashboard" class="mr-2" width="20" height="20" />
						Manage Form Templates
					</button>
					
					<button 
						onclick={navigateToFieldLibrary}
						class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
					>
						<Icon icon="iconoir:input-field" class="mr-2" width="20" height="20" />
						Explore Field Library
					</button>
					
					<!-- <button 
						onclick={navigateToAnalytics}
						class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
					>
						<Icon icon="material-symbols:analytics" class="mr-2" width="20" height="20" />
						Analytics
					</button> -->
				</div>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<!-- Total Templates -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Templates</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">{data.totalTemplates}</p>
					</div>
					<div class="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
						<Icon icon="material-symbols:description" class="text-blue-600 dark:text-blue-400" width="24" height="24" />
					</div>
				</div>
			</div>

			<!-- Total Submissions -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(data.totalSubmissions)}</p>
					</div>
					<div class="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg">
						<Icon icon="material-symbols:send" class="text-green-600 dark:text-green-400" width="24" height="24" />
					</div>
				</div>
			</div>

			<!-- Active Templates -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Templates</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">{data.stats.activeTemplates || 0}</p>
					</div>
					<div class="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
						<Icon icon="material-symbols:check-circle" class="text-purple-600 dark:text-purple-400" width="24" height="24" />
					</div>
				</div>
			</div>

			<!-- Response Rate -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">
							{data.totalTemplates > 0 ? Math.round((data.totalSubmissions / data.totalTemplates) * 10) / 10 : 0}%
						</p>
					</div>
					<div class="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
						<Icon icon="material-symbols:trending-up" class="text-orange-600 dark:text-orange-400" width="24" height="24" />
					</div>
				</div>
			</div>
		</div>

		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 gap-8">
			<!-- Recent Templates -->
			<div>
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<div class="flex items-center justify-between mb-6">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Templates</h3>
						<button 
							onclick={navigateToTemplates}
							class="text-orange-600 hover:text-orange-700 text-sm font-medium"
						>
							View All
						</button>
					</div>

					<div class="space-y-4">
						{#if data.templates && data.templates.length > 0}
							{#each data.templates.slice(0, 3) as template}
								<div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
									<div class="flex items-center space-x-4">
										<div class="flex items-center justify-center w-10 h-10 rounded-lg"
											style="background-color: {
												template.Type === 'survey' ? '#8B5CF6' : 
												template.Type === 'contact' ? '#3B82F6' : 
												'#10B981'
											}"
										>
											<span class="text-white font-semibold text-sm">
												{(template.Title || 'Untitled').substring(0, 2).toUpperCase()}
											</span>
										</div>
										<div>
											<h4 class="font-medium text-gray-900 dark:text-white">
												{template.Title || 'Untitled Template'}
											</h4>
											<p class="text-sm text-gray-500 dark:text-gray-400">
												{template.CurrentVersion ? `${template.CurrentVersion} fields` : '0 fields'} • Updated {formatDate(template.UpdatedAt || template.CreatedAt)}
											</p>
										</div>
									</div>
									<div class="flex items-center space-x-2">
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
											template.Status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
											'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
										}">
											{template.Status || 'Active'}
										</span>
									</div>
								</div>
							{/each}
						{:else}
							<div class="text-center py-8">
								<Icon icon="material-symbols:description-outline" class="mx-auto text-gray-400 mb-4" width="48" height="48" />
								<h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates yet</h4>
								<p class="text-gray-500 dark:text-gray-400 mb-4">Create your first form template to get started</p>
								<button 
									onclick={navigateToNewTemplate}
									class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
								>
									<Icon icon="material-symbols:add" class="mr-2" width="20" height="20" />
									Create Template
								</button>
							</div>
						{/if}
					</div>
				</div>

				<!-- Recent Activity -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
					<div class="flex items-center justify-between mb-6">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
						<button 
							onclick={navigateToSubmissions}
							class="text-orange-600 hover:text-orange-700 text-sm font-medium"
						>
							View All
						</button>
					</div>

					<div class="space-y-4">
						{#if data.recentActivity && data.recentActivity.length > 0}
							{#each data.recentActivity as activity}
								<div class="flex items-start space-x-3">
									<div class="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full">
										<Icon icon="material-symbols:check" class="text-blue-600 dark:text-blue-400" width="16" height="16" />
									</div>
									<div>
										<p class="text-sm text-gray-900 dark:text-white">
											{activity.description || 'Form submission received'}
										</p>
										<p class="text-xs text-gray-500 dark:text-gray-400">
											{formatDate(activity.timestamp || activity.CreatedAt)}
										</p>
									</div>
								</div>
							{/each}
						{:else}
							<div class="text-center py-4">
								<Icon icon="material-symbols:history" class="mx-auto text-gray-400 mb-2" width="32" height="32" />
								<p class="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
