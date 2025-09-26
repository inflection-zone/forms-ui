import { z } from "zod";
import { zfd } from "zod-form-data";

export const assessmentSchema = z.object({
    id: z.string(),
    Title: z
        .string()
        .min(8, { message: "Title must be at least 8 characters long." })
        .max(100, { message: "Title cannot exceed 100 characters." }),
    Description: z
        .string()
        .max(1024, { message: "Description cannot exceed 1024 characters." })
        .nullable()
        .optional(),

    TenantCode: z
        .string()
        .max(1024, { message: "Description cannot exceed 1024 characters." })
        .nullable()
        .optional(),
    Type: z.string().default('Survey'),
    CurrentVersion: zfd
        .numeric(z.number().min(0, { message: "Version cannot be negative." }).default(1))
        .nullable()
        .optional(),
    DefaultSectionNumbering: z.boolean().default(true),
    ItemsPerPage: z.string().default('AllQuestions'),
    IsFavourite: z.boolean().default(false)
});
export type AssessmentSchema = typeof assessmentSchema;


// import { z } from "zod";
// import { zfd } from "zod-form-data";

// export const assessmentSchema = z.object({
//     title: z.string().min(8).max(256),
//     description: z.string().optional(),
//     tenantCode: z.string().optional(),
//     type: z.string(),
//     currentVersion: zfd.numeric(z.number().default(0)).optional(),
//     defaultSectionNumbering: z.boolean().default(false),
//     itemsPerPage: z.string()
// });
// export type AssessmentSchema = typeof assessmentSchema;