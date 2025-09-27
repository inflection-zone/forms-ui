<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';

	// Props for user data
	let { user = { name: 'User', role: 'Member' } } = $props();

	// State for dropdowns
	let notificationsOpen = $state(false);
	let profileOpen = $state(false);

	// Mock notifications data
	const notifications = [
		{ id: 1, message: 'New form submission received', time: '2 min ago', unread: true },
		{ id: 2, message: 'Form template updated', time: '1 hour ago', unread: true },
		{ id: 3, message: 'Weekly report is ready', time: '2 hours ago', unread: false }
	];


	// Close dropdowns when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest('.notifications-dropdown')) {
			notificationsOpen = false;
		}
		if (!target.closest('.profile-dropdown')) {
			profileOpen = false;
		}
	}

	function toggleNotifications() {
		notificationsOpen = !notificationsOpen;
		profileOpen = false;
	}

	function toggleProfile() {
		profileOpen = !profileOpen;
		notificationsOpen = false;
	}

	function handleHelp() {
		// Handle help action
		console.log('Help clicked');
	}

	function handleLogout() {
		// Handle logout action
		window.location.href = '/';
	}

</script>

<svelte:window on:click={handleClickOutside} />

<!-- Top Navigation Bar -->
<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
	<div class="px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Left side - can be used for additional branding or controls -->
			<div class="flex items-center">
				<h1 class="text-xl font-semibold text-gray-900 dark:text-white">Form Builder</h1>
			</div>

			<!-- Right side - Navigation items -->
			<div class="flex items-center space-x-4">
				<!-- Help Button -->
				<button
					onclick={handleHelp}
					class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					title="Help"
				>
					<Icon icon="material-symbols:help-outline" width="20" height="20" />
				</button>

				<!-- Notifications Dropdown -->
				<div class="relative notifications-dropdown">
					<button
						onclick={toggleNotifications}
						class="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						title="Notifications"
					>
						<Icon icon="material-symbols:notifications-outline" width="20" height="20" />
						<!-- Notification badge -->
						{#if notifications.some(n => n.unread)}
							<span class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
						{/if}
					</button>

					{#if notificationsOpen}
						<div class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
							<div class="p-4">
								<h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Notifications</h3>
								<div class="space-y-3">
									{#each notifications as notification}
										<div class="flex items-start space-x-3 p-2 rounded-md {notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''}">
											<div class="flex-shrink-0">
												<div class="w-2 h-2 rounded-full {notification.unread ? 'bg-blue-600' : 'bg-gray-300'}"></div>
											</div>
											<div class="flex-1 min-w-0">
												<p class="text-sm text-gray-900 dark:text-white">{notification.message}</p>
												<p class="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
											</div>
										</div>
									{/each}
								</div>
								<div class="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
									<button class="text-sm text-orange-600 hover:text-orange-700 font-medium">
										View all notifications
									</button>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Profile Dropdown -->
				<div class="relative profile-dropdown">
					<button
						onclick={toggleProfile}
						class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<div class="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full font-semibold text-sm">
							{user.name.charAt(0)}
						</div>
						<Icon icon="material-symbols:keyboard-arrow-down" width="16" height="16" class="text-gray-400" />
					</button>

					{#if profileOpen}
						<div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
							<div class="p-2">
								<div class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
									<p class="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
									<p class="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
								</div>
								<div class="py-1">
									<button class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
										Profile Settings
									</button>
									<button class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
										Account Settings
									</button>
									<button 
										onclick={handleLogout}
										class="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
									>
										Sign Out
									</button>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
