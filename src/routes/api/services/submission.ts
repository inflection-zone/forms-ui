import { BACKEND_API_URL } from "$env/static/private";
import { get_, post_, put_ } from "./common";

export const createSubmission = async (
	templateId: string,
) => {
	const body = {
		FormTemplateId: templateId,
	};

	const url = BACKEND_API_URL + `/form-submissions`;
	return await post_(url, body);
};

export const submit = async (
	submissionKey: string,
) => {
	const body = {
		SubmissionKey: submissionKey
	};
	const url = BACKEND_API_URL + `/form-submissions/submit`;
	return await put_(url, body);
}

export const getFormSubmission = async (
	submissionId: string,
) => {
	const url = BACKEND_API_URL + `/form-submissions/${submissionId}`;
	return await get_(url);
}

export const searchFormSubmission = async (
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
	const url = BACKEND_API_URL + `/form-submissions/search${searchString}`;
	const res = await get_(url);
	console.log(res, 'result from submission')
	return res;
};
