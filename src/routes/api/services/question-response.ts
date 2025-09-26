import { BACKEND_API_URL } from "$env/static/private";
import { get_, post_ } from "./common";

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

export const createQuestionResponse = async (
    formSubmissionKey: string,
    questionResponses: QuestionResponseCreateModel[]
) => {
    const body = {
        FormSubmissionKey: formSubmissionKey,
        QuestionResponses: questionResponses
    };

    console.log('ResponseBody========', body)
    console.log('FormSubmissionKey being sent to backend:', formSubmissionKey);
    console.log('QuestionResponses being sent to backend:', questionResponses);

    const url = BACKEND_API_URL + `/question-responses/save`;
    const result = await post_(url, body);
    console.log('Backend response:', result);
    return result;
};

export const searchQuestionResponse = async (
    searchParams?: any
) => {
    console.log('Search params are ', searchParams);
    let searchString = '';
    if (searchParams) {
        const keys = Object.keys(searchParams);
        if (keys.length > 0) {
            searchString = '?';
            const params = [];
            for (const key of keys) {
                if (searchParams[key]) {
                    const param = `${key}=${searchParams[key]}`;
                    params.push(param);
                }
            }
            searchString += params.join('&');
        }
    }
    console.log('Search string is ', searchString);
    const url = BACKEND_API_URL + `/question-responses/search${searchString}`;
    console.log("url is ", url);
    const res = await get_(url);
    console.log("res is ", res);
    return res;
};
