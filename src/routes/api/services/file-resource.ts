import { INTERNAL_API_KEY, BACKEND_API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
// import { ServerHelper } from '$lib/server/server.helper';
import { Helper } from '$lib/utils/helper';
import axios from 'axios';
import { delete_, get_ } from './common';
// import { SessionManager } from '$routes/api/cache/session/session.manager';

////////////////////////////////////////////////////////////////

export const uploadBinary = async (
	// sessionId: string,
	buffer: Buffer,
	filename: string,
	isPublic = true
) => {
	const url = BACKEND_API_URL + `/file-resources/upload-binary`;
	// const session = await SessionManager.getSession(sessionId);
	// const accessToken = session.accessToken;

	const mimeType = Helper.getMimeTypeFromFileName(filename);
	console.log(`mimeType = ${mimeType}`);

	const headers = {};
	headers['Content-Type'] = 'application/octet-stream';
	headers['filename'] = filename;
	headers['public'] = isPublic ? 'true' : 'false';
	headers['x-api-key'] = INTERNAL_API_KEY;
	// headers['Authorization'] = `Bearer ${accessToken}`;
	headers['size'] = buffer.length.toString();

	const config = {
		method: 'post',
		url: url,
		headers: headers,
		data: buffer
	};

	// console.log(JSON.stringify(config, null, 2));

	const res = await axios(config);

	const response = res.data;

	if (response['Status'] === 'failure') {
		if (response['HttpCode'] !== 201 && response['HttpCode'] !== 200) {
			console.log(`get_ response message: ${response['Message']}`);
			throw error(response['HttpCode'], response['Message']);
		}
	}

	console.log(`get_ response message: ${response['Message']}`);
	return response;
};