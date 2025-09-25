// import { json, type RequestEvent } from '@sveltejs/kit';
import { type RequestEvent } from '@sveltejs/kit';

// import chalk from 'chalk';
import { createQuestionResponse } from '../../services/question-response';

//////////////////////////////////////////////////////////////

// export const POST = async (event: RequestEvent) => {
//     try {
//         const request = event.request;
//         const data = await request.json();

//         console.log(chalk.hex('#00f0ff')('Incoming request data:', JSON.stringify(data)));

//         const response = await createQuestionResponse(
//             data.FormSubmissionId,
//             data.Data
//         );

//         console.log(chalk.hex('#00f000')('Response from createQuestionResponse:', JSON.stringify(response)));

//         return json({
//             status: 'success',
//             message: 'Question response created successfully!',
//             data: response,
//         });
//     } catch (err) {
//         const error = err as Error; 
//         console.error(chalk.hex('#ff0000')(`Error creating question response: ${error.message}`));

//         return json(
//             {
//                 status: 'error',
//                 message: error.message || 'An error occurred while creating the question response.',
//             },
//             { status: 500 } 
//         );
//     }
// };


export const POST = async (event: RequestEvent) => {
    try {
        const request = event.request;
        const data = await request.json();

        console.log('Data from api/server/question-response', data);
        console.log('Question responses received:', JSON.stringify(data.questionResponses, null, 2));
        
        // Handle both offline form and regular form data structures
        const formSubmissionKey = data.formSubmissionKey || data.FormSubmissionId || data.submissionKey;
        const questionResponses = data.questionResponses || data.QuestionResponses;
        
        console.log('Extracted formSubmissionKey:', formSubmissionKey);
        console.log('Extracted questionResponses:', questionResponses);
        
        if (!formSubmissionKey) {
            throw new Error('Form submission key is required');
        }
        
        if (!questionResponses || !Array.isArray(questionResponses)) {
            throw new Error('Question responses array is required');
        }
        
        const response = await createQuestionResponse(
            formSubmissionKey,
            questionResponses,
        );
        console.log('Response from save form:', response);
        return new Response(JSON.stringify(response));
    } catch (err) {
        const error = err as Error; 
        console.error(`Error saving form: ${error.message}`);
        return new Response(JSON.stringify({
            Status: 'failure',
            HttpCode: 500,
            Message: error.message || 'An error occurred while saving form.',
        }));
    }
};
