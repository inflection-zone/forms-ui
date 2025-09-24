<script lang="ts">
	let { 
		chatbotOpen, 
		chatMessages, 
		chatInput, 
		onToggle, 
		onSendMessage, 
		onSendQuickMessage, 
		onChatEnter 
	}: {
		chatbotOpen: boolean;
		chatMessages: Array<{ content: string; type: 'user' | 'bot' }>;
		chatInput: string;
		onToggle: () => void;
		onSendMessage: () => void;
		onSendQuickMessage: (message: string) => void;
		onChatEnter: (event: KeyboardEvent) => void;
	} = $props();
</script>

<!-- CHATBOT TOGGLE BUTTON -->
<button 
	class="fixed bottom-5 right-5 w-15 h-15 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
	onclick={onToggle}
>
	💬
</button>

{#if chatbotOpen}
	<div class="fixed bottom-5 right-5 w-80 h-96 bg-card rounded-2xl shadow-2xl flex flex-col z-50 border border-border">
		<div class="p-5 bg-primary text-primary-foreground rounded-t-2xl flex justify-between items-center">
			<div>
				<h3 class="font-semibold">Analytics Assistant</h3>
				<p class="text-xs opacity-80">Ask questions about your form data</p>
			</div>
			<button 
				class="text-primary-foreground hover:text-primary-foreground/80"
				onclick={onToggle}
			>
				✖
			</button>
		</div>
		
		<div class="p-2 flex flex-wrap gap-1">
			<button 
				class="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80"
				onclick={() => onSendQuickMessage('Last 7 days')}
			>
				Last 7 Days
			</button>
			<button 
				class="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80"
				onclick={() => onSendQuickMessage('Export CSV')}
			>
				Export CSV
			</button>
			<button 
				class="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80"
				onclick={() => onSendQuickMessage('Top rated')}
			>
				Top Rated
			</button>
		</div>

		<div id="chatMessages" class="flex-1 p-5 overflow-y-auto">
			{#each chatMessages as message}
				<div class="mb-4 flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
					<div class="max-w-xs px-4 py-2 rounded-2xl text-sm {message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}">
						{message.content}
					</div>
				</div>
			{/each}
		</div>

		<div class="p-5 border-t border-border">
			<div class="flex gap-2">
				<input 
					id="chatInput"
					bind:value={chatInput}
					placeholder="Ask about your form data..."
					class="flex-1 px-4 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
					onkeypress={onChatEnter}
				>
				<button 
					class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
					onclick={onSendMessage}
				>
					Send
				</button>
			</div>
		</div>
	</div>
{/if}
