import { z } from "zod";
import { zfd } from "zod-form-data";

export const shareLinkCreateSchema = z.object({
	formId: z
		.string()
		.uuid({ message: "Form ID must be a valid UUID." })
		.min(1, { message: "Form ID is required." }),

	shareType: z
		.enum(['single', 'multiple'], {
			message: "Share type must be either 'single' or 'multiple'."
		})
		.default('single'),

	expiresInValue: zfd
		.numeric(z.number().min(1, { message: "Expiration value must be at least 1." }))
		.default(7),

	expiresInUnit: z
		.enum(['minutes', 'hours', 'days', 'weeks', 'months'], {
			message: "Expiration unit must be one of: minutes, hours, days, weeks, months."
		})
		.default('days'),

	multipleLinksCount: zfd
		.numeric(z.number().min(1, { message: "Multiple links count must be at least 1." }).max(100, { message: "Multiple links count cannot exceed 100." }))
		.optional(),

	emailList: z
		.string()
		.max(5000, { message: "Email list cannot exceed 5000 characters." })
		.optional()
		.nullable()
});

export const shareLinkEmailSchema = z.object({
	FormTemplateId: z
		.string()
		.uuid({ message: "Form Template ID must be a valid UUID." })
		.min(1, { message: "Form Template ID is required." }),

	EmailTo: z
		.string()
		.email({ message: "Please enter a valid email address." })
		.min(1, { message: "Email address is required." }),

	Message: z
		.string()
		.max(1000, { message: "Message cannot exceed 1000 characters." })
		.optional()
		.nullable()
});

export const shareLinkTrackSchema = z.object({
	responseId: z
		.string()
		.uuid({ message: "Response ID must be a valid UUID." })
		.min(1, { message: "Response ID is required." }),

	usedToken: z
		.string()
		.min(1, { message: "Used token is required." })
		.max(255, { message: "Used token cannot exceed 255 characters." })
});

export const shareLinkSearchSchema = z.object({
	formId: z
		.string()
		.uuid({ message: "Form ID must be a valid UUID." })
		.optional(),

	shareType: z
		.enum(['single', 'multiple'], {
			message: "Share type must be either 'single' or 'multiple'."
		})
		.optional(),

	isActive: z
		.boolean()
		.optional(),

	isExpired: z
		.boolean()
		.optional(),

	PageIndex: zfd
		.numeric(z.number().min(1, { message: "Page index must be at least 1." }))
		.optional()
		.default(1),

	ItemsPerPage: zfd
		.numeric(z.number().min(1, { message: "Items per page must be at least 1." }).max(100, { message: "Items per page cannot exceed 100." }))
		.optional()
		.default(10)
});

export const shareLinkUpdateSchema = z.object({
	shareType: z
		.enum(['single', 'multiple'], {
			message: "Share type must be either 'single' or 'multiple'."
		})
		.optional(),

	expiresAt: z
		.string()
		.datetime({ message: "Expiration date must be a valid datetime." })
		.optional(),

	isActive: z
		.boolean()
		.optional()
});

// Type exports
export type ShareLinkCreateSchema = typeof shareLinkCreateSchema;
export type ShareLinkEmailSchema = typeof shareLinkEmailSchema;
export type ShareLinkTrackSchema = typeof shareLinkTrackSchema;
export type ShareLinkSearchSchema = typeof shareLinkSearchSchema;
export type ShareLinkUpdateSchema = typeof shareLinkUpdateSchema;

// Validation functions
export const validateShareLinkCreate = (data: unknown) => {
	return shareLinkCreateSchema.parse(data);
};

export const validateShareLinkEmail = (data: unknown) => {
	return shareLinkEmailSchema.parse(data);
};

export const validateShareLinkTrack = (data: unknown) => {
	return shareLinkTrackSchema.parse(data);
};

export const validateShareLinkSearch = (data: unknown) => {
	return shareLinkSearchSchema.parse(data);
};

export const validateShareLinkUpdate = (data: unknown) => {
	return shareLinkUpdateSchema.parse(data);
};
