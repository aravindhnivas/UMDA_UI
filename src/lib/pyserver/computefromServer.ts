import { pyServerURL, get, server_timeout_in_minutes } from './stores';
import axios, { Axios, type AxiosResponse, type CancelToken } from 'axios';

interface ComputeFromServerType {
    pyfile: string;
    args: Record<string, any>;
    cancelToken?: CancelToken;
    scheduler?: boolean;
}

export default async function <T>({ pyfile, args, cancelToken, scheduler }: ComputeFromServerType) {
    try {
        console.warn({ pyfile, args });

        const URL = get(pyServerURL) + (scheduler ? '/enqueue_job' : '/compute');
        const timeout = get(server_timeout_in_minutes) ? Number(get(server_timeout_in_minutes)) : 5;
        const response = await axios.post<T>(
            URL,
            { pyfile, args: { ...args } },
            {
                headers: { 'Content-type': 'application/json' },
                timeout: 1000 * 60 * timeout, // default 5 minutes,
                cancelToken,
            },
        );

        console.log({ response });
        const { data: dataFromPython } = response;
        console.warn({ response, dataFromPython });

        if (response.status >= 400 && response.status < 600) {
            return Promise.reject(dataFromPython);
        }
        if (!dataFromPython) {
            return Promise.reject('could not get file from python. check the output json file');
        }
        console.warn(dataFromPython);
        return Promise.resolve(dataFromPython);
    } catch (err) {
        if (axios.isAxiosError(err)) {
            if (!err.response) return Promise.reject('Internal error: no response from server');
            console.error(err.response.data);
            const { error, traceback } = err.response.data as { error: string; traceback: string };
            return Promise.reject(`${error}\n${traceback}`);
        } else if (err instanceof Error) {
            console.error('Non-Axios error:', err);
            const msg = err.message;
            const details = err.stack || err;
            return Promise.reject(new Error(`Error after receiving data from python \n${msg} \n${details}`));
        }
    }
}

export async function redis_job_controller(job_id: string, action: 'cancel_job' | 'job_result') {
    try {
        const URL = `${get(pyServerURL)}/${action}/${job_id}`;

        let response: AxiosResponse;
        const headers = { 'Content-type': 'application/json' };
        if (action === 'cancel_job') {
            response = await axios.post<{ message: string }>(URL, { headers });
        } else {
            response = await axios.get<{ message: string; result?: any }>(URL, { headers });
        }

        console.log({ response });
        const { data: dataFromPython } = response;
        console.warn({ response, dataFromPython });

        if (response.status >= 400 && response.status < 600) {
            return Promise.reject(dataFromPython);
        }
        if (!dataFromPython) {
            return Promise.reject('could not get file from python. check the output json file');
        }
        console.warn(dataFromPython);
        return Promise.resolve(dataFromPython);
    } catch (err) {
        if (axios.isAxiosError(err)) {
            if (!err.response) return Promise.reject('Internal error: no response from server');
            console.error(err.response.data);
            const { error, traceback } = err.response.data as { error: string; traceback: string };
            return Promise.reject(`${error}\n${traceback}`);
        } else if (err instanceof Error) {
            console.error('Non-Axios error:', err);
            const msg = err.message;
            const details = err.stack || err;
            return Promise.reject(new Error(`Error after receiving data from python \n${msg} \n${details}`));
        }
    }
}
