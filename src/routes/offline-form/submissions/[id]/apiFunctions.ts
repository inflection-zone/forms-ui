import { addToast } from "$lib/components/toast/toast.store";
import chalk from "chalk";
import { z } from "zod";
export interface Question {
    id: string;
    Title: string;
    Description: string | null;
    ResponseType: string;
    Options: any | null;
    RangeMin: number | null;
    RangeMax: number | null;
    DisplayCode: string;
    ParentFormSection: {
        SectionIdentifier: string;
        Title: string;
    };
}
export async function save(model) {

    console.log(model);
    const url = `/api/server/question-response`;
    const headers = { 'Content-Type': 'application/json' };
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(model),
        headers
    });
    if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const responseData = await res.json();
    console.log(
        chalk.hex('#00ff00')(JSON.stringify(responseData), 'From showdata function return')
    );
    return responseData;

}

export async function submit(FormSubmissionId: string) {
    // const FormSubmissionId = $page.params.id;
    const url = `/api/server/submit`;
    const headers = { 'Content-Type': 'application/json' };
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(FormSubmissionId),
        headers
    });
    if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const responseData = await res.json();
    console.log(
        chalk.hex('#00ff00')(JSON.stringify(responseData), 'From showdata function return')
    );
    return responseData;

}

export type QuestionResponseCreateModel = {
    FormSubmissionId: string;
    FormTemplateId: string;
    ResponseType: string;
    QuestionId: string;
    IntegerValue: number | null;
    FloatValue: number | null;
    BooleanValue: string | null;
    DateTimeValue: string | null;
    Url: string | null;
    TextValue: string | null;
    FileResourceId: any | null;
    QuestionResponseId: string | null;
};

// export async function questionResponseModels(
//     sections,
//     answers,
//     FormSubmissionId,
//     questionResponseData
// ): Promise<QuestionResponseCreateModel[]> {
//     return sections.flatMap((section) =>
//         (section.Questions || []).map((question) => {
//             const key = question.id;
//             const value = answers[key];
//             const { ResponseType } = question;

//             const existingResponse = Array.isArray(questionResponseData) && questionResponseData.length > 0
//             ? questionResponseData.find((item) => item.Question.id === key)
//             : null;

//             const questionResponseId = existingResponse ? existingResponse.id : null;

//             return {
//                 id :questionResponseId,
//                 FormSubmissionId,
//                 ResponseType,
//                 QuestionId: key,
//                 IntegerValue: ["Integer", "Rating", "Range"].includes(ResponseType)
//                     ? (value !== undefined ? Number(value) : null)
//                     : null,
//                 FloatValue: ResponseType === "Float"
//                     ? (value !== undefined ? parseFloat(value) : null)
//                     : null,
//                 BooleanValue: ResponseType === "Boolean"
//                     ? (value !== undefined ? Boolean(value) : null)
//                     : null,
//                 DateTimeValue: ["Date", "DateTime"].includes(ResponseType)
//                     ? (value ? new Date(value).toISOString() : null)
//                     : null,
//                 Url: ResponseType === "URL"
//                     ? (value !== undefined ? value : null)
//                     : null,
//                 TextValue: ["Text", "TextArray", "SingleChoiceSelection", "MultiChoiceSelection", "Object"].includes(ResponseType)
//                     ? (value !== undefined ? (Array.isArray(value) ? value.join(", ") : value) : null)
//                     : null,
//                 FileResourceId: ResponseType === "File"
//                     ? (value !== undefined ? value : null)
//                     : null,
//             };
//         })
//     );
// }

export function createSchema(sections) {
    let schemaObj = {};
    sections.forEach((section) => {
        section.Questions?.forEach((q) => {
            if (q.IsRequired) {
                switch (q.ResponseType) {
                    case 'Text':
                    case 'Object':
                    case 'TextArray':
                    case 'BloodPressure':
                        schemaObj[q.id] = z
                            .string({
                                required_error: 'This field is required',
                                invalid_type_error: 'Please enter a valid text'
                            })
                            .nonempty('This field cannot be empty');
                        break;

                    case 'Integer':
                    case 'Float':
                    case 'Height':
                    case 'Weight':
                    case 'PulseRate':
                    case 'Temperature':
                        schemaObj[q.id] = z
                            .number({
                                required_error: 'This field is required',
                                invalid_type_error: 'Please enter a valid number'
                            })
                            .refine((val) => !isNaN(val), { message: 'Please enter a valid number' });
                        break;

                    case 'Boolean':
                        schemaObj[q.id] = z.string({
                            required_error: 'This field is required',
                            invalid_type_error: 'Please select an option'
                        });
                        break;

                    case 'SingleChoiceSelection':
                        schemaObj[q.id] = z
                            .string({
                                required_error: 'Please select an option'
                            })
                            .nonempty('Please select an option');
                        break;

                    case 'MultiChoiceSelection':
                        schemaObj[q.id] = z
                            .string({ required_error: 'Please select an option' })
                            .nonempty('Please select an option');
                        break;

                    case 'Date':
                    case 'DateTime':
                        schemaObj[q.id] = z
                            .string({
                                required_error: 'Please enter a date'
                            })
                            .refine((val) => !isNaN(Date.parse(val)), {
                                message: 'Please enter a valid date'
                            });
                        break;

                    case 'File':
                        schemaObj[q.id] = z.array(z.any()).min(1, 'Please upload a file');
                        break;

                    case 'Rating':
                        schemaObj[q.id] = z
                            .number({ required_error: 'Please enter a rating' })
                            .min(q.RangeMin ?? 1, `Rating must be at least ${q.RangeMin ?? 1}`)
                            .max(q.RangeMax ?? 5, `Rating must be at most ${q.RangeMax ?? 5}`);
                        break;
                    case 'Range':
                        schemaObj[q.id] = z
                            .string({
                                required_error: 'Please enter a value'
                            })
                            .refine((val) => !isNaN(Number(val)), {
                                message: 'Please enter a valid number'
                            });
                        break;

                    default:
                        console.warn(`Unknown ResponseType: ${q.ResponseType}`);
                        break;
                }
            }
        });

        // Recursively handle subsections
        if (section.Subsections?.length) {
            const subSchema = createSchema(section.Subsections);
            schemaObj = { ...schemaObj, ...subSchema.shape };
        }
    });

    if (Object.keys(schemaObj).length === 0) {
        console.warn('Schema is empty. Ensure sections have required fields.');
        return z.object({});
    }
    // console.log('schemaObj:----------- ', schemaObj);
    return z.object(schemaObj);
};

export async function questionResponseModels(
    sections,
    answers,
    FormSubmissionId,
    FormTemplateId,
    questionResponseData
): Promise<QuestionResponseCreateModel[]> {

    function extractQuestions(sectionList) {
        return sectionList.flatMap((section) => {
            const questions = section.Questions || [];

            // Recursively process nested subsections if they exist
            const nestedQuestions = section.Subsections ? extractQuestions(section.Subsections) : [];

            return [...questions, ...nestedQuestions];
        });
    }

    const allQuestions = extractQuestions(sections);

    return allQuestions.map((question) => {
        const key = question.id;
        const value = answers[key];
        const { ResponseType } = question;

        const existingResponse = Array.isArray(questionResponseData) && questionResponseData.length > 0
            ? questionResponseData.find((item) => item.Question.id === key)
            : null;

        const questionResponseId = existingResponse ? existingResponse.id : null;

        return {
            id: questionResponseId,
            FormSubmissionId,
            FormTemplateId,
            ResponseType,
            QuestionId: key,
            IntegerValue: ["Integer", "Rating", "Range"].includes(ResponseType)
                ? (value !== undefined ? Number(value) : null)
                : null,
            FloatValue: ["Float", "Height", "Weight", "Temperature", "PulseRate"].includes(ResponseType)
                ? (value !== undefined ? parseFloat(value) : null)
                : null,
            BooleanValue: ResponseType === "Boolean"
                ? (value !== undefined ? value : null)
                : null,
            DateTimeValue: ["Date", "DateTime"].includes(ResponseType)
                ? (value ? new Date(value).toISOString() : null)
                : null,
            Url: ResponseType === "URL"
                ? (value !== undefined ? value : null)
                : null,
            TextValue: ["Text", "TextArray", "SingleChoiceSelection", "MultiChoiceSelection", "Object", 'BloodPressure'].includes(ResponseType)
                ? (value !== undefined ? (Array.isArray(value) ? value.join(", ") : value) : null)
                : null,
            FileResourceId: ResponseType === "File"
                ? (value !== undefined ? value : null)
                : null,
        };
    });
}


