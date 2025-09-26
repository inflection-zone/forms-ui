<script lang="ts">
	let { templateInfo }: { templateInfo: any } = $props();

	// Pagination state
	let currentPage = $state(1);
	const itemsPerPage = 10;

	// Extract individual responses from templateInfo
	let individualResponses = $derived(templateInfo?.Items?.map((item: any) => ({
		id: item.FormSubmission?.id || 'N/A',
		title: item.FormSubmission?.Title || 'N/A',
		submittedAt: item.FormSubmission?.SubmittedAt ? new Date(item.FormSubmission.SubmittedAt).toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}) : 'N/A',
		status: item.FormSubmission?.Status || 'N/A',
		type: item.FormSubmission?.Type || 'N/A',
		questionTitle: item.Question?.Title || 'N/A',
		responseType: item.Question?.ResponseType || 'N/A',
		answer: getAnswerValue(item),
		displayCode: item.Question?.DisplayCode || 'N/A'
	})) || []);

	// Group responses by submission ID for table view
	let groupedResponses = $derived.by(() => {
		const grouped: { [key: string]: any } = {};
		
		individualResponses.forEach(response => {
			const submissionId = response.id;
			if (!grouped[submissionId]) {
				grouped[submissionId] = {
					id: submissionId,
					title: response.title,
					submittedAt: response.submittedAt,
					status: response.status,
					type: response.type,
					responses: {}
				};
			}
			grouped[submissionId].responses[response.questionTitle] = response.answer;
		});
		
		return Object.values(grouped);
	});

	// Get unique question titles for table headers
	let questionHeaders = $derived.by(() => {
		const headers = new Set<string>();
		individualResponses.forEach(response => {
			if (response.questionTitle !== 'N/A') {
				headers.add(response.questionTitle);
			}
		});
		return Array.from(headers);
	});

	// Response type mapping - mapping question response types to field names
	const responseTypeMap = {
		Integer: 'IntegerValue',
		Float: 'FloatValue',
		Boolean: 'BooleanValue',
		Text: 'TextValue',
		TextArray: 'TextValue',
		SingleChoiceSelection: 'TextValue',
		MultiChoiceSelection: 'TextValue',
		Object: 'TextValue',
		File: 'FileResourceId',
		Date: 'DateTimeValue',
		DateTime: 'DateTimeValue',
		Rating: 'IntegerValue',
		Location: 'DateTimeValue',
		Range: 'IntegerValue',
		Height: 'FloatValue',
		Weight: 'FloatValue',
		PulseRate: 'FloatValue',
		BloodPressure: 'TextValue',
		Temperature: 'FloatValue'
	};

	// Function to extract the actual answer value based on response type
	function getAnswerValue(item: any): string {
		console.log('getAnswerValue called with item:', item);
		console.log('Question ResponseType:', item.Question?.ResponseType);
		
		// Check if the response type is already a field name (like IntegerValue, TextValue, etc.)
		const responseType = item.Question?.ResponseType;
		let fieldName: string;
		let value: any;
		
		// If response type is already a field name, use it directly
		if (['IntegerValue', 'FloatValue', 'BooleanValue', 'TextValue', 'DateTimeValue', 'FileResourceId'].includes(responseType)) {
			fieldName = responseType;
			value = item[fieldName];
		} else {
			// Otherwise, use the mapping
			fieldName = responseTypeMap[responseType] || 'TextValue';
			value = item[fieldName];
		}
		
		console.log('Using field name:', fieldName, 'Value:', value);
		
		// Handle different value types
		if (value === null || value === undefined) {
			return 'No answer provided';
		}
		
		// Handle Boolean values
		if (fieldName === 'BooleanValue') {
			return value ? 'Yes' : 'No';
		}
		
		// Handle DateTime values
		if (fieldName === 'DateTimeValue') {
			return new Date(value).toLocaleString();
		}
		
		// Handle numeric values
		if (fieldName === 'IntegerValue' || fieldName === 'FloatValue') {
			return value.toString();
		}
		
		// Handle text values (including arrays)
		if (fieldName === 'TextValue') {
			return Array.isArray(value) ? value.join(', ') : value;
		}
		
		// Handle file values
		if (fieldName === 'FileResourceId') {
			return value ? `File: ${value}` : 'No file';
		}
		
		// Fallback
		return String(value);
	}

	// Pagination calculations for grouped responses
	let totalResponses = $derived(groupedResponses.length);
	let totalPages = $derived(Math.ceil(totalResponses / itemsPerPage));
	let paginatedResponses = $derived.by(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return groupedResponses.slice(startIndex, endIndex);
	});

	// Debug logging
	$effect(() => {
		console.log('TemplateInfo structure:', templateInfo);
		console.log('TemplateInfo Items:', templateInfo?.Items);
		if (templateInfo?.Items?.[0]) {
			console.log('First item structure:', templateInfo.Items[0]);
			console.log('First item Question:', templateInfo.Items[0].Question);
			console.log('First item response fields:', {
				BooleanValue: templateInfo.Items[0].BooleanValue,
				DateTimeValue: templateInfo.Items[0].DateTimeValue,
				FloatValue: templateInfo.Items[0].FloatValue,
				IntegerValue: templateInfo.Items[0].IntegerValue,
				TextValue: templateInfo.Items[0].TextValue,
				FileResourceId: templateInfo.Items[0].FileResourceId
			});
		}
		console.log('Paginated responses are ', paginatedResponses);
	});


	// Pagination functions
	function goToPreviousPage() {
		if (currentPage > 1) {
			currentPage = currentPage - 1;
		}
	}

	function goToNextPage() {
		if (currentPage < totalPages) {
			currentPage = currentPage + 1;
		}
	}

	// Format response type for display
	function formatResponseType(responseType: string): string {
		const typeMap: { [key: string]: string } = {
			'Float': 'Number',
			'Integer': 'Number',
			'String': 'Text',
			'Text': 'Long Text',
			'Boolean': 'Yes/No',
			'DateTime': 'Date & Time',
			'Date': 'Date',
			'Time': 'Time'
		};
		return typeMap[responseType] || responseType;
	}

</script>

<div class="bg-card rounded-xl shadow-sm border border-border">
	<!-- Header -->
	<div class="p-6 border-b border-border">
		<div class="flex justify-between items-center">
			<div>
				<h3 class="text-lg font-semibold text-card-foreground">Individual Responses</h3>
				<p class="text-muted-foreground text-sm mt-1">
					Showing {paginatedResponses.length} of {totalResponses} submissions
				</p>
			</div>
			<button class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
				Export PDF
			</button>
		</div>
	</div>

	{#if paginatedResponses.length > 0}
		<!-- Table View -->
		<div class="p-6">
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr class="border-b border-border">
							<!-- <th class="text-left p-3 font-semibold text-card-foreground bg-muted/50">Submission ID</th> -->
							<!-- <th class="text-left p-3 font-semibold text-card-foreground bg-muted/50">Submitted At</th>
							<th class="text-left p-3 font-semibold text-card-foreground bg-muted/50">Status</th> -->
							{#each questionHeaders as questionTitle}
								<th class="text-left p-3 font-semibold text-card-foreground bg-muted/50 min-w-[200px]">
									{questionTitle}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each paginatedResponses as submission}
							<tr class="border-b border-border hover:bg-muted/30 transition-colors">
								<!-- <td class="p-3 text-sm text-muted-foreground font-mono">
									{submission.id}
								</td> -->
								<!-- <td class="p-3 text-sm text-muted-foreground">
									{submission.submittedAt}
								</td> -->
								<!-- <td class="p-3">
									<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
										{submission.status === 'Completed' ? 'bg-green-100 text-green-800' : 
										 submission.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 
										 'bg-gray-100 text-gray-800'}">
										{submission.status}
									</span>
								</td> -->
								{#each questionHeaders as questionTitle}
									<td class="p-3 text-sm text-card-foreground">
										<div class="max-w-[300px] truncate" title={submission.responses[questionTitle] || 'No answer'}>
											{submission.responses[questionTitle] || 'No answer'}
										</div>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="px-6 py-4 border-t border-border">
				<div class="flex items-center justify-between">
					<div class="text-sm text-muted-foreground">
						Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalResponses)} of {totalResponses} submissions
					</div>
					<div class="flex items-center gap-2">
						<!-- Previous Button -->
						<button
							class="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							onclick={goToPreviousPage}
							disabled={currentPage === 1}
						>
							Previous
						</button>

						<!-- Next Button -->
						<button
							class="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							onclick={goToNextPage}
							disabled={currentPage === totalPages}
						>
							Next
						</button>
					</div>
				</div>
			</div>
		{/if}
	{:else}
		<div class="p-6">
			<div class="text-center py-8">
				<div class="text-muted-foreground mb-2">No submissions available</div>
				<div class="text-sm text-muted-foreground">Form submissions will appear here once responses are received.</div>
			</div>
		</div>
	{/if}
</div>
