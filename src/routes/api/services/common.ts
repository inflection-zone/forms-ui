import { error } from '@sveltejs/kit';
import chalk from 'chalk';
import { INTERNAL_API_KEY, TOKEN } from '$env/static/private';

/////////////////////////////////////////////////////////////////////////

const headers = {
    'Content-Type': 'application/json'
};

interface ApiResponse {
    Status: 'success' | 'failure';
    HttpCode: number;
    Message: string;
}

// Logging styles for different HTTP methods
const logStyles = {
    GET: {
        request: chalk.bgBlue.white.bold(' GET '),
        response: chalk.blue.bold('📥 GET Response'),
        color: chalk.blue
    },
    POST: {
        request: chalk.bgGreen.white.bold(' POST '),
        response: chalk.green.bold('📤 POST Response'),
        color: chalk.green
    },
    PUT: {
        request: chalk.bgYellow.black.bold(' PUT '),
        response: chalk.yellow.bold('🔄 PUT Response'),
        color: chalk.yellow
    },
    DELETE: {
        request: chalk.bgRed.white.bold(' DELETE '),
        response: chalk.red.bold('🗑️ DELETE Response'),
        color: chalk.red
    }
};

export const get_ = async (url: string) => {
    try {
        const headers = await setHeaders();
        const style = logStyles.GET;

        // Request logging
        console.log(style.request + ' ' + style.color(`Request URL: ${url}`));

        const res = await fetch(url, { method: 'GET', headers });
        const response = await res.json();

        handleResponse(response, url, 'GET');

        return response;
    } catch (err) {
        handleError(err, url, 'GET');
        throw error(500, 'An error occurred while processing the GET request');
    }
};

export const post_ = async (url: string, bodyObj: unknown) => {
    try {
        const headers = await setHeaders();
        const style = logStyles.POST;

        // Request logging
        console.log(style.request + ' ' + style.color(`Request URL: ${url}`));
        console.log(style.color('📦 Request Body:'), JSON.stringify(bodyObj, null, 2));

        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(bodyObj)
        });
        const response = await res.json();

        handleResponse(response, url, 'POST');

        return response;
    } catch (err) {
        handleError(err, url, 'POST');
        throw error(500, 'An error occurred while processing the POST request');
    }
};

export const put_ = async (url: string, bodyObj: unknown) => {
    try {
        const headers = await setHeaders();
        const style = logStyles.PUT;

        // Request logging
        console.log(style.request + ' ' + style.color(`Request URL: ${url}`));
        console.log(style.color('📦 Request Body:'), JSON.stringify(bodyObj, null, 2));

        const res = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(bodyObj)
        });
        const response = await res.json();

        handleResponse(response, url, 'PUT');

        return response;
    } catch (err) {
        handleError(err, url, 'PUT');
        throw error(500, 'An error occurred while processing the PUT request');
    }
};

export const delete_ = async (url: string) => {
    try {
        const headers = await setHeaders();
        const style = logStyles.DELETE;

        // Request logging
        console.log(style.request + ' ' + style.color(`Request URL: ${url}`));

        const res = await fetch(url, {
            method: 'DELETE',
            headers
        });
        const response = await res.json();

        handleResponse(response, url, 'DELETE');

        return response;
    } catch (err) {
        handleError(err, url, 'DELETE');
        throw error(500, 'An error occurred while processing the DELETE request');
    }
};

export const getBlob_ = async (url: string) => {
    try {
        const headers = await setHeaders();
        const style = logStyles.GET;

        // Request logging
        console.log(style.request + ' ' + style.color(`Request URL: ${url}`));

        const res = await fetch(url, { method: 'GET', headers });

        if (!res.ok) {
            throw new Error(`Failed to fetch blob: ${res.statusText}`);
        }

        const blob = await res.blob();
        console.log(style.response + ' ' + style.color(`from ${url}`));
        console.log(style.color('📄 Blob Response: [Binary data]'));

        return blob;
    } catch (err) {
        handleError(err, url, 'GET');
        throw error(500, 'An error occurred while processing the GET blob request');
    }
};

const handleResponse = (response: ApiResponse, url: string, method: string): void | null => {
    const style = logStyles[method as keyof typeof logStyles];

    // Detailed response logging
    console.log(style.response + ' ' + style.color(`from ${url}`));

    if (!url.includes('/form-templates/') || !url.includes('/details')) {
        console.log(style.color('📄 Full Response:'), JSON.stringify(response, null, 2));
    } else {
        console.log(style.color('📄 Response: [Large response - skipped logging]'));
    }

    if (response.Status === 'failure') {
        if (response.HttpCode === 404) {
            console.log(chalk.red(`${method} ${url} -  ${chalk.bgRed.white.bold(' 404 ')}: ${response.Message}`));
            return null;
        }
        console.log(chalk.yellow(`${method} ${url} - ${chalk.bgYellow.black.bold(` ${response.HttpCode} `)}: ${response.Message}`));
        throw error(response.HttpCode, response.Message);
    }
    console.log(chalk.hex('#009933')(`${method} ${(url)} - ${chalk.bgGreen.black.bold(' Success ')}: ${response.Message}`));
};

const handleError = (err: unknown, url: string, method: string): void => {
    const style = logStyles[method as keyof typeof logStyles];
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    console.error(style.color('❌') + ' ' + chalk.red(`${method} ${url} - ${chalk.bgRed.white.bold(' Error ')}: ${errorMessage}`));
};


export const setHeaders = async () => {
    try {
        const headers = {
            'x-api-key': INTERNAL_API_KEY
        };

        headers['Content-Type'] = 'application/json';
        headers['Authorization'] = `Bearer ${TOKEN}`;

        return headers;
    } catch (err) {
        console.log(chalk.red(`Error in setHeaders: ${(err as Error).message}`));
        throw new Error(`Failed to set headers: ${(err as Error).message}`);
    }
};
