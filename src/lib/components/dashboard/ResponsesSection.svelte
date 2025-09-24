<script lang="ts">
	let { formData, responses }: { formData: any; responses: any[] } = $props();
</script>

<div class="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
	<div class="p-6 border-b border-border">
		<div class="flex flex-wrap gap-4 items-center justify-between">
			<h3 class="text-lg font-semibold text-card-foreground">Response Explorer ({formData.totalResponses.toLocaleString()} responses)</h3>
			<div class="flex gap-2">
				<input 
					type="text" 
					placeholder="Search responses..." 
					class="px-4 py-2 border border-input rounded-lg text-sm bg-background text-foreground"
				>
				<select class="px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground">
					<option>All Status</option>
					<option>Completed</option>
					<option>Partial</option>
				</select>
				<select class="px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground">
					<option>Last 30 days</option>
					<option>Last 7 days</option>
					<option>Today</option>
				</select>
			</div>
		</div>
	</div>
	<div class="p-3 flex justify-between items-center border-b border-border">
		<div class="flex items-center gap-2">
			<input type="checkbox" class="rounded">
			<span class="text-sm text-muted-foreground">Select All</span>
			<button class="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80">
				Export Selected
			</button>
		</div>
		<select class="px-3 py-1 border border-input rounded text-sm bg-background text-foreground">
			<option>Show 25</option>
			<option>Show 50</option>
		</select>
	</div>
	<table class="w-full">
		<thead>
			<tr class="bg-muted">
				<th class="px-4 py-3 text-left text-sm font-semibold text-muted-foreground"></th>
				<th class="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Response ID</th>
				<th class="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Submitted</th>
				<th class="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
				<th class="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Rating</th>
				<th class="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Source</th>
				<th class="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each responses as response}
				<tr class="hover:bg-muted/50 border-b border-border">
					<td class="px-4 py-3"><input type="checkbox" class="rounded"></td>
					<td class="px-4 py-3">
						<span class="text-primary font-medium cursor-pointer">{response.id}</span>
					</td>
					<td class="px-4 py-3 text-foreground">{response.submitted}</td>
					<td class="px-4 py-3">
						<span class="px-2 py-1 rounded-full text-xs font-medium {response.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}">
							{response.status}
						</span>
					</td>
					<td class="px-4 py-3 text-foreground">{response.rating}</td>
					<td class="px-4 py-3 text-foreground">{response.source}</td>
					<td class="px-4 py-3">
						<button class="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80">
							View
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
