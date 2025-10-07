// import type { FileUploadModel } from '$lib/types/file.upload.types';
import type { ImageUploadModel } from '$lib/components/forms/file-upload/file-upload-model';
import { ResponseHandler } from '$lib/utils/response.handler';
// import { fileUploadSchema } from '$lib/validation/file.upload.schema';
// import { profileFileUploadSchema } from '$lib/validation/profile.schema';
import { imageUploadSchema } from '$lib/components/forms/file-upload/file-upload-schema';
// import { uploadBinary } from '$routes/api/services/file-resource';
import { uploadBinary } from '../../../services/file-resource';
// import type { RequestEvent, RequestHandler } from './$types';
import type { RequestEvent } from '../../../../$types';
import type { RequestHandler } from '@sveltejs/kit';
import * as fs from 'fs';

//////////////////////////////////////////////////////////////

export const POST: RequestHandler = async (event: RequestEvent) => {
	try {
		console.log(`Upload in progress---`);

		const formData = await event.request.formData();
		console.log('formData', formData);
		let filename: string;
		const file = formData.get('file') as File;
		filename = file.name;

		const fileCreateModel: ImageUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const validationResult = imageUploadSchema.safeParse(fileCreateModel);
		console.log('validation result from server', validationResult);
		if (!validationResult.success) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'Validation failed',
				Errors: Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || ''
					])
				)
			});
		}

		const buffer = await file.arrayBuffer();
		const filePath = `/tmp/${filename}`;
		fs.writeFileSync(filePath, Buffer.from(buffer));

		if (fs.existsSync(filePath)) {
			console.log(`Copied file ${filename} to server /tmp.`);
		}

		// const sessionId = event.locals?.sessionUser?.sessionId;
		// const tenantId = event.locals?.sessionUser?.tenantCode;
		const fileBuffer = fs.readFileSync(filePath);

		console.log('Uploading file resource ...');
		const response = await uploadBinary(
			// sessionId,
			fileBuffer,
			filename,
			true
		);
		console.log(JSON.stringify(response, null, 2));

		fs.unlinkSync(filePath);

		return new Response(JSON.stringify(response), { status: 201 });
	} catch (err) {
		console.error(`Error uploading file: ${err}`);
		return new Response(JSON.stringify({ Status: 'error', Message: err.message }), { status: 500 });
	}
};
