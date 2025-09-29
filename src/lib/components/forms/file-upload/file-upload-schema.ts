import { z } from 'zod';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml'
];

export const imageUploadSchema = z.object({
    UploadFile: z.custom<File>(
        (file) => {
            if (!file || !(file instanceof File)) return false;

            const isValidSize = file.size <= MAX_IMAGE_SIZE;
            const isValidType = allowedImageTypes.includes(file.type);

            return isValidSize && isValidType;
        },
        {
            message: 'Upload must be an image (png, jpg, jpeg, webp, gif, svg) and less than 5MB.'
        }
    ),
    FileName: z.string({
        required_error: 'File name is required.',
        invalid_type_error: 'File name must be a string.'
    }),
    FileType: z.string({
        required_error: 'File type is required.',
        invalid_type_error: 'File type must be a string.'
    })
});