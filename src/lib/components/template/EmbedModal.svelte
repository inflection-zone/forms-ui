<script lang="ts">
	import Icon from '@iconify/svelte';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import { errorMessage, successMessage } from '../toast/message.utils';

	let { 
		showModal = $bindable(false), 
		templateId = '',
		onClose = () => {} 
	} = $props();

	let loading = $state(false);
	let markdownContent = $state('');
	let copied = $state(false);


	// Fetch embed content from backend
	async function fetchEmbedContent() {
		if (!templateId) return;
		
		loading = true;
		try {
			const response = await fetch('/api/server/form-embed', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ templateId })
			});

			const result = await response.json();

			if (result.success && result.data) {
				// Assuming the backend returns markdown content in a 'content' or 'markdown' field
				const rawMarkdown = result.data.Data || '';
				const htmlContent = await marked(rawMarkdown);
				markdownContent = processMarkdownWithCopyButtons(htmlContent);
			} else {
				console.error('Failed to fetch embed content:', result.error);
				// Fallback to basic instructions
				const fallbackHtml = await marked(getFallbackMarkdown());
				markdownContent = processMarkdownWithCopyButtons(fallbackHtml);
			}
		} catch (error) {
			console.error('Error fetching embed content:', error);
			const fallbackHtml = await marked(getFallbackMarkdown());
			markdownContent = processMarkdownWithCopyButtons(fallbackHtml);
		} finally {
			loading = false;
		}
	}

	// Fallback markdown content
	function getFallbackMarkdown() {
		return `# Unable to generate embeddable content`;
	}

	// Copy content to clipboard
	async function copyToClipboard(content: string) {
		try {
			await navigator.clipboard.writeText(content);
			copied = true;
			setTimeout(() => (copied = false), 2000);
			successMessage('Content copied to clipboard');
		} catch (error) {
			errorMessage('Failed to copy content');
		}
	}

	// Copy code block content
	async function copyCodeBlock(event: Event) {
		const button = event.target as HTMLButtonElement;
		const codeBlock = button.closest('.code-block-container')?.querySelector('pre code') as HTMLElement;
		if (codeBlock) {
			const code = codeBlock.textContent || '';
			await copyToClipboard(code);
		}
	}

	// Process markdown to add copy buttons to code blocks
	function processMarkdownWithCopyButtons(htmlContent: string): string {
		// Add copy buttons to code blocks
		return htmlContent.replace(
			/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
			(match, attributes, codeContent) => {
				return `
					<div class="code-block-container relative">
						<pre><code${attributes}>${codeContent}</code></pre>
						<button 
							class="absolute top-2 right-2 p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs opacity-75 hover:opacity-100 transition-opacity"
							onclick="copyCodeBlock(event)"
							title="Copy code"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
								<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
							</svg>
						</button>
					</div>
				`;
			}
		);
	}

	// Close modal handler
	function closeModal() {
		showModal = false;
		onClose();
	}

	// Watch for modal state changes and template ID changes
	$effect(() => {
		if (showModal && templateId) {
			fetchEmbedContent();
		}
	});

	// Configure marked options for better rendering
	onMount(() => {
		marked.setOptions({
			breaks: true,
			gfm: true,
		});

		// Make copyCodeBlock function available globally for dynamically generated buttons
		(window as any).copyCodeBlock = copyCodeBlock;
	});

	// Button class helper
	function getButtonClasses(variant: 'default' | 'outline' | 'ghost' = 'default') {
		const baseClasses = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
		
		const variants = {
			default: 'bg-primary text-primary-foreground hover:bg-primary/90',
			outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
			ghost: 'hover:bg-accent hover:text-accent-foreground'
		};

		return `${baseClasses} ${variants[variant]}`;
	}
</script>

<!-- Embed Modal -->
{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.target === e.currentTarget && closeModal()} onkeydown={(e) => e.key === 'Escape' && closeModal()}>
		<div class="max-w-6xl w-[90vw] h-[85vh] rounded-lg bg-background shadow-lg flex flex-col" role="document">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-border">
				<div>
					<h2 class="text-xl font-semibold">Embed Form Instructions</h2>
					<p class="text-sm text-muted-foreground mt-1">Learn how to embed this form in your website</p>
				</div>
				<button 
					class="{getButtonClasses('ghost')} h-8 w-8 p-0" 
					onclick={closeModal}
				>
					<Icon icon="material-symbols:close" width="20" height="20" />
				</button>
			</div>

			<!-- Content Area -->
			<div class="flex-1 overflow-hidden">
				<!-- Instructions Content -->
				<div class="h-full overflow-y-auto p-6">
					{#if loading}
						<div class="flex items-center justify-center h-32">
							<div class="animate-spin">
								<Icon icon="material-symbols:progress-activity" width="24" height="24" />
							</div>
							<span class="ml-2 text-sm text-muted-foreground">Loading instructions...</span>
						</div>
					{:else}
						<div class="prose prose-sm max-w-none dark:prose-invert">
							{@html markdownContent}
						</div>
					{/if}
				</div>
			</div>

			<!-- Footer -->
			<div class="flex justify-end gap-3 p-6 border-t border-border">
				<button 
					class="{getButtonClasses('outline')}"
					onclick={closeModal}
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom styles for markdown content */
	:global(.prose h1) {
		@apply text-xl font-bold mt-6 mb-4;
	}
	
	:global(.prose h2) {
		@apply text-lg font-semibold mt-5 mb-3;
	}
	
	:global(.prose h3) {
		@apply text-base font-medium mt-4 mb-2;
	}
	
	:global(.prose p) {
		@apply mb-3 leading-relaxed;
	}
	
	:global(.prose code) {
		@apply bg-muted px-1.5 py-0.5 rounded text-sm font-mono;
	}
	
	:global(.prose pre) {
		@apply bg-muted p-4 rounded-lg overflow-x-auto my-4;
	}
	
	:global(.prose pre code) {
		@apply bg-transparent p-0;
	}
	
	:global(.prose ul, .prose ol) {
		@apply mb-4 pl-6;
	}
	
	:global(.prose li) {
		@apply mb-1;
	}
	
	:global(.prose blockquote) {
		@apply border-l-4 border-border pl-4 italic my-4;
	}

	/* Code block container styles */
	:global(.code-block-container) {
		position: relative;
	}
	
	:global(.code-block-container button) {
		transition: all 0.2s ease;
	}
	
	:global(.code-block-container:hover button) {
		opacity: 1;
	}
</style>
