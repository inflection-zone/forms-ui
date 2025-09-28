<script lang="ts">
	
	import DashboardSidebar from '$lib/components/dashboard/DashboardSidebar.svelte';
	import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
	import DashboardTabs from '$lib/components/dashboard/DashboardTabs.svelte';
	import OverviewSection from '$lib/components/dashboard/OverviewSection.svelte';
	import ResponsesSection from '$lib/components/dashboard/ResponsesSection.svelte';
	import IndividualSection from '$lib/components/dashboard/IndividualSection.svelte';
	import ExportSection from '$lib/components/dashboard/ExportSection.svelte';
	import Chatbot from '$lib/components/dashboard/Chatbot.svelte';
	import { page } from '$app/state';
	import type { PageServerData } from './$types';


	let { data }: { data: PageServerData } = $props();
	console.log('Data is ', data);

	// Reactive state
	let activeView = $state('overview');
	let chatbotOpen = $state(false);
	let chatMessages: Array<{ content: string; type: 'user' | 'bot' }> = $state([
		{ content: '👋 Hi! Ask me anything about your form data.', type: 'bot' }
	]);


    const userId = $derived(page.params.userId);
    const templateId = $derived(page.params.templateId);
	let chatInput = $state('');


	// Function to calculate submitted responses count from template info data
	function calculateSubmittedResponsesCount(templateInfo: any): number {
		if (!templateInfo?.Items || !Array.isArray(templateInfo.Items)) return 0;
		
		// Count only responses where FormSubmission.Status is "Submitted"
		return templateInfo.Items.filter((item: any) => 
			item.FormSubmission?.Status === "Submitted"
		).length;
	}

	// Function to calculate in-progress responses count from template info data
	function calculateInProgressResponsesCount(templateInfo: any): number {
		if (!templateInfo?.Items || !Array.isArray(templateInfo.Items)) return 0;
		
		// Count only responses where FormSubmission.Status is "InProgress"
		return templateInfo.Items.filter((item: any) => 
			item.FormSubmission?.Status === "InProgress"
		).length;
	}

	// Dynamic data from backend
	const formData = $derived({
		title: data.details.Data?.Title || 'Untitled Form',
		description: data.details.Data?.Description || '',
		created: data.details.Data?.CreatedAt ? new Date(data.details.Data?.CreatedAt).toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		}) : 'Unknown',
		lastModified: data.details.Data?.UpdatedAt ? new Date(data.details.Data.UpdatedAt).toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		}) : 'Unknown',
		status: 'Active',
		version: data.templateInfo?.Version || '1',
		displayCode: data.templateInfo?.DisplayCode || '',
		type: data.templateInfo?.Type || '',
		questions: data.templateInfo.TotalCount || 0,
		totalResponses: calculateSubmittedResponsesCount(data.templateInfo),
		inProgressResponses: calculateInProgressResponsesCount(data.templateInfo)
	});


	// Chart data
	const responseTrendData = {
		labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		datasets: [{
			label: 'Responses',
			data: [45, 67, 89, 72, 56, 34, 28],
			borderColor: '#3b82f6',
			backgroundColor: 'rgba(59,130,246,0.1)',
			tension: 0.4,
			fill: true
		}]
	};

	const sourceData = {
		labels: ['Email', 'Direct', 'Social', 'Embedded'],
		datasets: [{
			data: [45, 28, 18, 9],
			backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
			borderWidth: 0
		}]
	};

	const performanceData = {
		labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
		datasets: [{
			label: 'Completion Rate',
			data: [98, 96, 94, 89, 92, 87],
			backgroundColor: '#3b82f6',
			borderRadius: 4
		}]
	};


	const funnelData = {
		labels: ['Started', 'Partial', 'Completed'],
		datasets: [{
			label: 'Count',
			data: [1500, 1300, 1247],
			backgroundColor: ['#f59e0b', '#f97316', '#10b981'],
			borderRadius: 4
		}]
	};

	// Functions
	function showView(viewName: string) {
		activeView = viewName;
	}

	function toggleChatbot() {
		chatbotOpen = !chatbotOpen;
		if (chatbotOpen) {
			setTimeout(() => {
				const input = document.getElementById('chatInput') as HTMLInputElement;
				input?.focus();
			}, 100);
		}
	}

	function sendQuickMessage(message: string) {
		addChatMessage(message, 'user');
		setTimeout(() => {
			addChatMessage(`Bot response for ${message}`, 'bot');
		}, 1000);
	}

	function sendChatMessage() {
		if (!chatInput.trim()) return;
		addChatMessage(chatInput, 'user');
		chatInput = '';
		setTimeout(() => {
			addChatMessage(`Bot response for ${chatInput}`, 'bot');
		}, 1000);
	}

	function addChatMessage(content: string, type: 'user' | 'bot') {
		chatMessages = [...chatMessages, { content, type }];
		setTimeout(() => {
			const chatContainer = document.getElementById('chatMessages');
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}

	function handleChatEnter(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			sendChatMessage();
		}
	}

</script>

<div class=" min-h-screen bg-background text-foreground pt-8">
	<!-- SIDEBAR -->
	<DashboardSidebar {activeView} onViewChange={showView} />

	<!-- MAIN CONTENT -->
	<main class="ml-64 flex-1 p-5">
		<!-- HEADER -->
		<DashboardHeader {formData} {userId} {templateId} />

		<!-- TABS -->
		<DashboardTabs {activeView} onViewChange={showView} />

		<!-- CONTENT SECTIONS -->
		{#if activeView === 'overview'}
			<OverviewSection {formData} {responseTrendData} {sourceData} {userId} {templateId} submissionsData={data.submissions} />
		{/if}


		{#if activeView === 'responses'}
			<ResponsesSection templateInfo={data.templateInfo} />
		{/if}

		{#if activeView === 'individual'}
			<IndividualSection templateInfo={data.templateInfo} />
		{/if}


		{#if activeView === 'export'}
			<ExportSection />
		{/if}
	</main>

</div>

<!-- CHATBOT -->
<Chatbot 
	{chatbotOpen} 
	{chatMessages} 
	{chatInput} 
	onToggle={toggleChatbot}
	onSendMessage={sendChatMessage}
	onSendQuickMessage={sendQuickMessage}
	onChatEnter={handleChatEnter}
/>

