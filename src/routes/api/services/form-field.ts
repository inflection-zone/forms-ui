import { BACKEND_API_URL } from '$env/static/private';
import chalk from 'chalk';
import { delete_, get_, post_, put_ } from './common';

////////////////////////////////////////////////////////////////

export const createQuestion = async (
	model: any
) => {
	console.log(model)
	const url = BACKEND_API_URL + `/form-fields`;
	return await post_(url, model);
};

export const getQuestionById = async (
	questionId: string
) => {
	const url = BACKEND_API_URL + `/form-fields/${questionId}`;
	return await get_(url);
};

export const getQuestionsByTemplateId = async (
	searchParams?: any
) => {
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
	console.log(`this is template id and this is node ${searchString}`)
	const url = BACKEND_API_URL + `/form-fields/search${searchString}`;
	const res = await get_(url);
	return res
};

export const updateQuestion = async (
	qestionId: string,
	title: string,
	description?: string,
	responseType?: string,
	score?: number,
	correctAnswer?: string,
	hint?: string,
	imageResourceId?: string,
	options?: string[],
	rangeMin?: number,
	rangeMax?: number,
	isRequired?: boolean,
	validateLogicId?: string,
	skipLogicId?: string,
	calculateLogicId?: string
) => {
	const body = {
		Title: title,
		...(description && { Description: description }),
		ResponseType: responseType,
		...(score && { Score: score }),
		...(correctAnswer && { CorrectAnswer: correctAnswer }),
		...(hint && { Hint: hint }),
		...(imageResourceId && { ImageResourceId: imageResourceId }),
		...(rangeMin && { RangeMin: rangeMin }),
		...(rangeMax && { RangeMax: rangeMax }),
		...(options && options.length > 0 && { Options: options }),
		...(isRequired && { IsRequired: isRequired }),
		...(validateLogicId && { ValidateLogicId: validateLogicId }),
		...(skipLogicId && { SkipLogicId: skipLogicId }),
		...(calculateLogicId && { CalculateLogicId: calculateLogicId })
	};

	console.log(body)

	const url = BACKEND_API_URL + `/form-fields/${qestionId}`;
	return await put_(url, body);
};

export const deleteQuestion = async (
	questionId: string,
) => {
	console.log(chalk.red("questionId to delete.........................?", questionId))

	const url = BACKEND_API_URL + `/form-fields/${questionId}`;
	return await delete_(url);
};




