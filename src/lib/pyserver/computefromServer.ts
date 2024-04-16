import { pyServerURL, get } from './stores';
import { path, fs } from '@tauri-apps/api';
import { get_tmpdir } from '$utils/index';
import axios from 'axios';
interface Type {
    pyfile: string;
    args: Object;
    target?: HTMLButtonElement | null;
    general?: boolean;
}

const loading_class = 'running';

export default async function <T>({ pyfile, args, target, general }: Type): Promise<T | string | undefined> {
    try {
        console.time('Computation took');
        console.warn({ pyfile, args, target, general });
        if (!general) {
            target?.classList.add(loading_class);
            const filename = pyfile.split('.').at(-1) + '_data.json';

            const tempdirPath = await get_tmpdir();
            const outputFile = await path.join(tempdirPath, filename);
            console.warn(await path.dirname(outputFile));
            if (await fs.exists(outputFile)) {
                const [_err] = await oO(fs.removeFile(outputFile));
                if (_err) console.error(_err);
            }
        }

        const response = await axios.post(
            get(pyServerURL),
            { pyfile, args: { ...args, general } },
            {
                headers: { 'Content-type': 'application/json' },
                // timeout: 1000 * 60 * 5, // 5 minutes,
                timeout: 0, // infinite timeout
            },
        );

        console.log({ response });
        if (target?.classList.contains(loading_class)) {
            target.classList.remove(loading_class);
        }

        console.timeEnd('Computation took');
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
    } catch (error) {
        if (target?.classList.contains(loading_class)) {
            target.classList.remove(loading_class);
        }

        if (error instanceof Error) {
            const msg = error.message;
            const details = error.stack || error;
            // console.error(error, error.response?.data);
            return Promise.reject(new Error(`Error after receiving data from python \n${msg} \n${details}`));
        }
    }
}
