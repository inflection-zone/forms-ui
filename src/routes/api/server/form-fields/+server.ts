import { json, type RequestEvent } from '@sveltejs/kit';
import { createQuestion, deleteQuestion, updateQuestion } from '../../services/form-field';
import { questionSchema } from '$lib/components/forms/question-schema';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('Data from api/server/form-fields POST:', data);

        // Check if this is a Field Library field with rich configuration
        const isFieldLibraryField = data.ParentTemplateId && data.ParentSectionId && data.ResponseType;
        
        // Helper: remove undefined/null and sanitize DefaultExpectedUnit
        const isUuid = (val: unknown) =>
            typeof val === 'string' &&
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(val);

        const normalizeOptions = (responseType: string, options: any): any[] => {
            if (!Array.isArray(options)) return [];
            // Only attach options for selection/boolean response types
            const selectable = ['SingleChoiceSelection', 'MultiChoiceSelection', 'Boolean'];
            if (!selectable.includes(responseType)) return [];

            const toText = (item: any): string | null => {
                if (!item) return null;
                if (typeof item === 'string') return item;
                if (typeof item === 'number') return String(item);
                if (item.Text) return String(item.Text);
                if (item.label) return String(item.label);
                if (item.value) return String(item.value);
                if (item.min !== undefined && item.max !== undefined) {
                    return item.label ? String(item.label) : `${item.min}-${item.max}`;
                }
                return null;
            };

            const normalized: any[] = [];
            options.forEach((opt: any, idx: number) => {
                const text = toText(opt);
                if (text) {
                    normalized.push({ Text: text, Sequence: idx + 1, ...(opt.ImageUrl ? { ImageUrl: opt.ImageUrl } : {}) });
                }
            });
            return normalized;
        };

        const prune = (obj: Record<string, any>) => {
            const cleaned: Record<string, any> = {};
            for (const [k, v] of Object.entries(obj)) {
                if (v === undefined || v === null) continue;
                // Only allow DefaultExpectedUnit if it's a UUID (FK to input_unit_lists)
                if (k === 'DefaultExpectedUnit' && !isUuid(v)) continue;
                // Do not send empty Options arrays; backend treats missing as optional
                if (k === 'Options' && Array.isArray(v) && v.length === 0) continue;
                cleaned[k] = v;
            }
            return cleaned;
        };

        let model;
        if (isFieldLibraryField) {
            // Use Field Library configuration - data is already in correct format
            model = prune({
                ParentTemplateId: data.ParentTemplateId,
                ParentSectionId: data.ParentSectionId,
                ResponseType: data.ResponseType,
                Title: data.Title,
                Description: data.Description,
                IsRequired: data.IsRequired,
                Hint: data.Hint,
                Options: normalizeOptions(data.ResponseType, data.Options),
                RangeMin: data.RangeMin,
                RangeMax: data.RangeMax,
                DefaultExpectedUnit: data.DefaultExpectedUnit,
                PageBreakAfter: data.PageBreakAfter,
                // Add Field Library identifiers
                IsFieldLibraryField: data.IsFieldLibraryField,
                FieldLibraryId: data.FieldLibraryId,
                FieldLibraryType: data.FieldLibraryType
            });
            console.log('Using Field Library configuration:', model);
        } else {
            // Use basic configuration for Basic/HealthCare fields
            model = prune({
                ParentTemplateId: data.parentFormTemplateId,
                ParentSectionId: data.parentSectionId,
                ResponseType: data.responseType
            });

            if (data.responseType === 'Height') {
                model['Title'] = 'Height (Centimeter)?';
            }
            if (data.responseType === 'Weight') {
                model['Title'] = 'Body Weight (Kilograms)?';
            }
            if (data.responseType === 'Temperature') {
                model['Title'] = 'Body Temperature (Fahrenheit)?';
            }
            if (data.responseType === 'PulseRate') {
                model['Title'] = 'Heart Pulse Rate (in beats per minute)?';
            }
            if (data.responseType === 'BloodPressure') {
                model['Title'] = 'Blood Pressure (in mmHg)?';
            }
            // Basic/health care do not carry options here
            console.log('Using basic configuration:', model);
        }
        const response = await createQuestion(model);

        console.log('Response from createQuestion:', response);
        return new Response(JSON.stringify(response));
    } catch (err) {
        const error = err as Error;
        console.error(`Error creating form field: ${error.message}`);
        return new Response(JSON.stringify({
            Status: 'failure',
            HttpCode: 500,
            Message: error.message || 'An error occurred while creating the form field.',
        }));
    }
};

export const DELETE = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('Form field ID from api/server/form-fields DELETE:', data.questionId);

        const response = await deleteQuestion(data.questionId);

        return json({
            status: 'success',
            message: response.message || 'Form field deleted successfully!',
        });
    } catch (err) {
        const error = err as Error;
        console.error(`Error deleting form field: ${error.message}`);

        return json(
            {
                status: 'error',
                message: error.message || 'An error occurred while deleting the form field.',
            },
            { status: 500 }
        );
    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        console.log("in the try of update question card ")
        const request = event.request;
        const data = await request.json();

        console.log('data from api/server/form-fields:', data);

        const result = await questionSchema.safeParseAsync(data);
        console.log('result from api/server/form-fields PUT:', JSON.stringify(result, null, 2));
        if (!result.success) {
            return new Response(JSON.stringify({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            }));
        }

        console.log("before calling service",data)
        const response = await updateQuestion(
            data.id,
            data.Title,
            data.Description,
            data.ResponseType,
            data.Score,
            data.CorrectAnswer,
            data.Hint,
            data.ImageResourceId,
            data.Options,
            data.RangeMin,
            data.RangeMax,
            data.IsRequired,
            data.ValidateLogicId,
            data.SkipLogicId,
            data.CalculateLogicId
        );
        return new Response(JSON.stringify(response))
    } catch (error) {
        console.error(`Error updating the form field: ${error.message}`);
        return new Response(JSON.stringify({
            Status: 'failure',
            HttpCode: 500,
            Message: error.message || 'An error occurred while updating the form field.',
        }));
    }
}; 