import { pyServerURL, get } from './stores';
import axios from 'axios';

interface Type {
    pyfile: string;
    args: Object;
    target?: HTMLButtonElement | null;
    general?: boolean;
    cancelToken?: any;
}

export default async function <T>({
    pyfile,
    args,
    target,
    general,
    cancelToken,
}: Type): Promise<T | string | undefined> {
    try {
        console.warn({ pyfile, args, target, general });
        const response = await axios.post(
            get(pyServerURL),
            { pyfile, args: { ...args, general } },
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

        if (!dataFromPython) return Promise.reject('could not get file from python. check the output json file');
        console.warn(dataFromPython);

        if (general) {
            const { done } = dataFromPython;
            if (!done) Promise.reject(done);
            return Promise.resolve(<string>done);
        }

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
