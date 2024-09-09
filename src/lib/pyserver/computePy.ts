import { suppress_py_warnings } from '$pages/settings/stores';
import computefromServer from './computefromServer';
import computefromSubprocess from './computefromSubprocess';
import { fetchServerROOT, start_and_check_umdapy_with_toast } from './umdapyServer';
import { pyServerReady, get, developerMode, pyProgram } from './stores';
import { Alert } from '$utils/stores';
interface ComputePyType {
    pyfile: string;
    args: Object;
    target: HTMLButtonElement;
    subprocess?: boolean;
    cancelToken?: any;
}

export default async function <T extends Record<string, any>>({
    target,
    pyfile,
    args,
    subprocess,
    cancelToken,
}: ComputePyType) {
    let dataFromPython: T & { done: boolean; error: boolean; computed_time: string };

    try {
        console.log(`Running python in ${subprocess ? 'subprocess' : 'server'} mode`);
        console.warn(`Running python in ${get(developerMode) ? 'developer' : 'production'} mode \n ${get(pyProgram)}`);
        console.warn({ pyfile, args, subprocess });
        if (subprocess) {
            const response = await computefromSubprocess<T>({
                pyfile,
                args,
                target,
            });
            if (!response) return Promise.reject('error');
            dataFromPython = response as T & { done: boolean; error: boolean; computed_time: string };
            return Promise.resolve(dataFromPython);
        }
        if (!get(pyServerReady)) {
            await fetchServerROOT();
            const result = await dialog.ask('Start the server ?', {
                type: 'error',
                title: 'umdapy server not running',
            });
            console.log(result);
            if (!result) return Promise.reject('Server not started');
            await start_and_check_umdapy_with_toast();
        }
        const response = await computefromServer<T>({
            pyfile,
            args,
            cancelToken,
        });

        if (!response) return Promise.reject('error');
        dataFromPython = response;
        if (!get(suppress_py_warnings)) {
            if ((dataFromPython as any)?.warnings) {
                Alert.warn((dataFromPython as any).warnings);
            }
        }
        return Promise.resolve(dataFromPython);
    } catch (error) {
        Alert.error(error);
    }
}
