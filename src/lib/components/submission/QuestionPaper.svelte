<script lang="ts">
	import BloodOxygen from './healthCare/BloodOxygen.svelte';
	import QuestionPaper from './QuestionPaper.svelte';
	import {
		BoolSubmission,
		DateSubmission,
		FileSubmission,
		FloatIntegerSubmission,
		MultipleChoicesSubmission,
		RangeSubmission,
		RatingSubmission,
		SingleChoiceSubmission,
		TextSubmission
	} from './basic';
	import {
		BloodPressureSubmission,
		HeightForm,
		PulseRateForm,
		TemperatureForm,
		WeightForm
	} from './healthCare';

	import {
		FormRuleExecutor,
		type Form,
		type FormField,
		OperationType,
		OperandType,
		OperandDataType
	} from './engine'; // adjust path

	let { sections, answers = $bindable(), errors = $bindable(), isSubmitted } = $props();

	// ------------------------------------------------------------------
	// 1. Convert backend sections → engine Form
	// ------------------------------------------------------------------
	function parseMaybeJson(val: any) {
		if (val == null) return null;
		if (typeof val === 'string') {
			try { return JSON.parse(val); } catch { return null; }
		}
		return val;
	}

	function normalizeOperand(op: any) {
		return {
			Type: op.Type as OperandType,
			DataType: op.DataType as OperandDataType,
			Value: op.Value,
			FieldId: op.FieldId,
			FunctionName: op.FunctionName,
			FunctionArgs: op.FunctionArgs ? op.FunctionArgs.map(normalizeOperand) : undefined
		};
	}

	function normalizeOperation(op: any): any {
		if (!op) return null;
		switch (op.Type as OperationType) {
			case OperationType.Logical:
			case OperationType.Mathematical: {
				const raw = parseMaybeJson(op.Operands) ?? op.Operands ?? [];
				const Operands = (raw as any[]).map(normalizeOperand);
				return { ...op, Operands };
			}
			case OperationType.Composition: {
				const Children = (op.Children ?? []).map(normalizeOperation);
				return { ...op, Children };
			}
			case OperationType.Iterate: {
				return {
					...op,
					ArrayOperand: normalizeOperand(op.ArrayOperand),
					Operation: normalizeOperation(op.Operation)
				};
			}
			case OperationType.FunctionExpression: {
				const rawVars = parseMaybeJson(op.Variables) ?? op.Variables ?? {};
				const Variables: Record<string, any> = {};
				Object.entries(rawVars).forEach(([k, v]) => (Variables[k] = normalizeOperand(v)));
				return { ...op, Variables };
			}
			default:
				return op;
		}
	}

	function mapBackendToForm(backendSections): Form {
		const fields: FormField[] = [];

		function traverse(sections) {
			sections?.forEach((sec) => {
				sec.FormFields?.forEach((f) => {
					const key = f.FieldId || f.id;
					fields.push({
						FieldId: key,
						Name: f.Title,
						Label: f.Title,
						ResponseType: f.ResponseType,
						Required: f.IsRequired,
						Value: answers[key] ?? null,
						SkipLogic: f.SkipLogic ? { ...f.SkipLogic, Rules: f.SkipLogic.Rules?.map((r) => ({ ...r, Operation: normalizeOperation(r.Operation) })) } : null,
						CalculateLogic: f.CalculateLogic ? { ...f.CalculateLogic, Rules: f.CalculateLogic.Rules?.map((r) => ({ ...r, Operation: normalizeOperation(r.Operation), ConditionForOperation: r.ConditionForOperation ? normalizeOperation(r.ConditionForOperation) : undefined })) } : null,
						// ✅ Preserve all validation rules + operations
						ValidateLogic: f.ValidateLogic
							? {
									...f.ValidateLogic,
									Rules: f.ValidateLogic.Rules?.map((r) => {
										const normalizedOp = normalizeOperation(r.Operation);
										console.log('🔍 Normalizing validation rule:', { original: r.Operation, normalized: normalizedOp });
										return {
											...r,
											Operation: normalizedOp
										};
									})
								}
							: null
					});
				});
				if (sec.Subsections?.length) traverse(sec.Subsections);
			});
		}

		traverse(backendSections);
		return { id: 'form-id', Name: 'Live Form', Fields: fields };
	}

	// ------------------------------------------------------------------
	// 2. Executor instance
	// ------------------------------------------------------------------
	let executor: FormRuleExecutor;
	$effect(() => {
		const form = mapBackendToForm(sections);
		executor = new FormRuleExecutor(form);
		// Seed current answers into executor at initialization
		for (const field of form.Fields) {
			const v = answers[field.FieldId];
			if (v !== undefined) executor.setFieldValue(field.FieldId, v);
		}
		runAllLogics();
	});

	// ------------------------------------------------------------------
	// 3. Run logic and update visible fields + errors
	// ------------------------------------------------------------------
	let visibleSet = new Set<string>();
	let touched = new Set<string>();
	let prevAnswers: Record<string, any> = {};

	async function runAllLogics() {
		if (!executor) return;
		
		// Execute all field logics (skip, calculation, validation)
		const results = await executor.executeAllFieldLogics();
		const visibleFields = await executor.getVisibleFields();
		visibleSet = new Set(visibleFields.map((f) => f.FieldId));

		// Apply calculated values to answers
		for (const [fieldId, result] of results.entries()) {
			if (result.calculatedValue !== undefined) {
				answers[fieldId] = result.calculatedValue;
			}
		}

		// Validation: only show for touched fields with non-empty values
		const { errors: formErrors } = await executor.validateForm();
		
		const nextErrors: Record<string, string> = {};
		for (const [fid, msgs] of formErrors.entries()) {
			const val = answers[fid];
			// Show validation errors for touched fields with non-empty values
			if (touched.has(fid) && val !== null && val !== undefined && val !== '') {
				if (Array.isArray(msgs) && msgs.length > 0) {
					nextErrors[fid] = msgs[0];
				}
			}
		}
		errors = nextErrors;
	}

	// Track which field changed to enable error display post-input
	let isRunningLogics = $state(false);
	$effect(() => {
		if (isRunningLogics) return; // Prevent recursive calls
		
		const current = answers || {};
		let anyChanged = false;
		for (const fid of Object.keys(current)) {
			executor.setFieldValue(fid, current[fid]);
			if (prevAnswers[fid] !== current[fid]) {
				touched.add(fid);
				anyChanged = true;
			}
		}
		prevAnswers = { ...current };
		if (anyChanged) {
			isRunningLogics = true;
			runAllLogics();
			isRunningLogics = false;
		}
	});

	// ------------------------------------------------------------------
	// 4. Handle input updates
	// ------------------------------------------------------------------
	function handleAnswerChange(fieldId: string, value: any) {
		answers[fieldId] = value;
		executor.setFieldValue(fieldId, value);
		// touched will be set by the answers watcher
	}

	// ------------------------------------------------------------------
	// 5. Field visibility for section
	// ------------------------------------------------------------------
	function visibleForSection(section) {
		return new Set(
			section.FormFields?.filter((f) => visibleSet.has(f.FieldId || f.id)).map(
				(f) => f.FieldId || f.id
			)
		);
	}

	// ------------------------------------------------------------------
	// 6. Component map
	// ------------------------------------------------------------------
	const componentsMap = {
		Text: TextSubmission,
		Float: FloatIntegerSubmission,
		Integer: FloatIntegerSubmission,
		Boolean: BoolSubmission,
		Object: TextSubmission,
		TextArray: TextSubmission,
		File: FileSubmission,
		SingleChoiceSelection: SingleChoiceSubmission,
		MultiChoiceSelection: MultipleChoicesSubmission,
		Date: DateSubmission,
		DateTime: DateSubmission,
		Rating: RatingSubmission,
		Range: RangeSubmission,
		Height: HeightForm,
		Weight: WeightForm,
		Temperature: TemperatureForm,
		PulseRate: PulseRateForm,
		BloodPressure: BloodPressureSubmission,
		Glucose: BloodOxygen,
		BloodOxygenSaturation: BloodOxygen,
		Hematocrit: BloodOxygen,
		Cholesterol: BloodOxygen,
		RespiratoryRate: BloodOxygen,
		Electrolytes: BloodOxygen,
		KidneyFunction: BloodOxygen,
		Lipoprotein: BloodOxygen,
		CReactiveProtein: BloodOxygen,
		Sleep: BloodOxygen,
		HemoglobinA1C: BloodOxygen,
		WaistCircumference: BloodOxygen
	};
</script>

{#each sections ?? [] as s}
	<div class="mb-4 min-h-[300px] border p-5">
		<h4 class="text-md font-semibold">Section: {s.Title || 'Untitled Section'}</h4>
		<p class="text-sm text-gray-600">{s.Description}</p>

		{#key answers}
			{#if s?.FormFields?.length}
				{@const visible = visibleForSection(s)}
				{#each s.FormFields as sq}
					{@const fid = sq.FieldId || sq.id}
					{@const Component = componentsMap[sq.ResponseType]}
					{#if visible.has(fid)}
                        <div class="mt-2 border p-3">
                            <Component
                                q={sq}
                                bind:answers
                                bind:errors
                                {isSubmitted}
                            />
							<!-- {#if errors[fid]}
								<p class="text-sm text-red-500">{errors[fid]}</p>
							{/if} -->
						</div>
					{/if}
				{/each}
			{/if}
		{/key}

		<div class="p-5">
			{#if s?.Subsections?.length > 0}
				<QuestionPaper sections={s.Subsections} bind:answers bind:errors {isSubmitted} />
			{/if}
		</div>
	</div>
{/each}
