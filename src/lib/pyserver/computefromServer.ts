import { pyServerURL, get } from './stores';
import axios from 'axios';

interface ComputeFromServerType {
    pyfile: string;
    args: Object;
    cancelToken?: any;
}

export default async function <T>({ pyfile, args, cancelToken }: ComputeFromServerType) {
    try {
        console.warn({ pyfile, args });

        const response = await axios.post<T & { done: boolean; error: boolean; computed_time: string }>(
            get(pyServerURL),
            { pyfile, args: { ...args } },
            {
                headers: { 'Content-type': 'application/json' },
                // timeout: 1000 * 60 * 5, // 5 minutes,
                timeout: 0, // infinite timeout
                cancelToken,
            },
        );

        console.log({ response });
        const { data: dataFromPython } = response;
        console.warn({ response, dataFromPython });
        if (response.statusText !== 'OK') {
            return Promise.reject(dataFromPython);
        }

        if (!dataFromPython) {
            return Promise.reject('could not get file from python. check the output json file');
        }
        toast.success(`${pyfile} completed in ${dataFromPython.computed_time}`);
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
