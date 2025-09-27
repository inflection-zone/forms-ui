import { BACKEND_API_URL } from "$env/static/private";
import { get_, post_, put_, delete_ } from "./common";

// Create share link
export const createShareLink = async (
	shareData: {
		formId: string;
		shareType: 'single' | 'multiple';
		expiresInValue: number;
		expiresInUnit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
		multipleLinksCount?: number;
		emailList?: string;
	}
) => {
	const url = BACKEND_API_URL + `/share-link`;
	return await post_(url, shareData);
};

// Send link via email
export const sendSingleLinkViaEmail = async (
	emailData: {
		FormTemplateId: string;
		EmailTo: string;
		Message?: string;
	}
) => {
	const url = BACKEND_API_URL + `/share-link/send-single-link`;
	return await post_(url, emailData);
};

export const sendMultipleLinkViaEmail = async (
	emailData: {
		FormTemplateId: string;
		EmailList: string;
		Message?: string;
	}
) => {
	const url = BACKEND_API_URL + `/share-link/send-multiple-link`;
	return await post_(url, emailData);
};
