import { type RequestEvent } from '@sveltejs/kit';
import { createSection, deleteSection, updateSection } from '../../services/section';
import { json } from '@sveltejs/kit';
import { updateFormTemplate } from '../../services/form-template';

////////////////////////////////////////////////////////////////////////////////////////////

// Custom error type for extended error properties
interface CustomError extends Error {
    statusCode?: number;
    details?: string;
}

////////////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const url = new URL(event.request.url);
        const userId = url.searchParams.get('userId');
        const limit = Number(url.searchParams.get('limit')) || 10;

        // Generate dummy templates data for dashboard
        const templates = [];
        const templateTypes = ['survey', 'contact', 'registration', 'feedback', 'application'];
        const templateTitles = [
            'Customer Feedback Survey',
            'Product Registration Form', 
            'Event Registration',
            'Contact Us Form',
            'Newsletter Signup',
            'Job Application Form',
            'Service Request Form',
            'Bug Report Form',
            'User Feedback Form',
            'Product Survey'
        ];

        for (let i = 0; i < Math.min(limit, templateTitles.length); i++) {
            const randomDate = new Date();
            randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));

            templates.push({
                id: `tmpl_${Math.random().toString(36).substring(2, 15)}`,
                Title: templateTitles[i],
                Description: `This is a ${templateTypes[Math.floor(Math.random() * templateTypes.length)]} template`,
                Type: templateTypes[Math.floor(Math.random() * templateTypes.length)],
                CurrentVersion: Math.floor(Math.random() * 20) + 1,
                Status: Math.random() > 0.3 ? 'active' : 'draft',
                CreatedAt: randomDate.toISOString(),
                UpdatedAt: randomDate.toISOString(),
                OwnerUserId: userId,
                TenantCode: 'default',
                IsPublished: Math.random() > 0.4,
                FieldCount: Math.floor(Math.random() * 15) + 3,
                SubmissionCount: Math.floor(Math.random() * 100) + 10
            });
        }

        // Sort by updated date descending
        templates.sort((a, b) => new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime());

        return json({
            HttpCode: 200,
            State: 'success',
            Message: 'Templates retrieved successfully',
            Data: {
                Items: templates,
                TotalCount: templates.length,
                Page: 1,
                PageSize: limit
            }
        });

    } catch (error) {
        console.error('Templates GET error:', error);
        return json({
            HttpCode: 500,
            State: 'error',
            Message: 'Failed to retrieve templates',
            Data: null
        }, { status: 500 });
    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('data from api/server/template:', data);

        const response = await updateFormTemplate(
            data.id,
            data.Title,
            data.Description,
            data.TenantCode,
            data.CurrentVersion,
            data.Type,
            data.ItemsPerPage,
            // data.OwnerUserId
        );
        // return json({
        //     status: 'success',
        //     message: response.message || 'Section updated successfully!',
        //     data: response,
        // });
        console.log(response);
        
        return new Response(JSON.stringify(response))
    } catch (err) {
        const error = err as CustomError;
        console.error(`Error updating the section: ${error.message}`);
        return json(
            {
                status: 'error',
                message: error.message || 'An error occurred while updating the section.',
                details: error.details || null,
            },
            { status: 500 }
        );
    }
};