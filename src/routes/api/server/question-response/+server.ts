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

        console.log('Data from api/server/submit', data);
        console.log('Data from api/server/question-response:', data);
        console.log('formSubmissionKey:', data.formSubmissionKey);
        console.log('questionResponses count:', data.questionResponses?.length);
        console.log('First question response FormSubmissionId:', data.questionResponses?.[0]?.FormSubmissionId);
        
        const response = await createQuestionResponse(
                        data.formSubmissionKey,
                        data.questionResponses,
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
