import computefromServer from './computefromServer';
import computefromSubprocess from './computefromSubprocess';
import { fetchServerROOT, start_and_check_umdapy_with_toast } from './umdapyServer';
import { pyServerReady, get, developerMode, pyProgram } from './stores';
import { Alert } from '$utils/stores';

interface Type {
    pyfile: string;
    args: Object;
    target?: HTMLButtonElement | null;
    general?: boolean;
    cancelToken?: any;
    e?: Event;
}

export default async function <T extends Record<string, any>>({ e, target, pyfile, args, general, cancelToken }: Type) {
    target ||= e?.target as HTMLButtonElement;

    let dataFromPython: T & { done: boolean; error: boolean; computed_time: string };
    let processDivGeneral;
    let processDivGeneralNum = 0;

    try {
        console.log(`Running python in ${general ? 'subprocess' : 'server'} mode`);
        console.warn(`Running python in ${get(developerMode) ? 'developer' : 'production'} mode \n ${get(pyProgram)}`);

        console.warn({ pyfile, args, general });
        if (general) {
            if (target) {
                processDivGeneral = target.getElementsByClassName('tag')?.[0];
                console.log(processDivGeneral);
                if (processDivGeneral) {
                    const num = processDivGeneral.textContent as string;
                    processDivGeneralNum = isNaN(parseInt(num)) ? 0 : parseInt(num);
                    processDivGeneral.textContent = `${processDivGeneralNum + 1}`;
                }
            }
            dataFromPython = await computefromSubprocess<T>({
                target,
                pyfile,
                args,
            });
            console.log(dataFromPython);
        } else {
            if (!get(pyServerReady)) {
                await fetchServerROOT();
                const result = await dialog.ask('Start the server ?', {
                    type: 'error',
                    title: 'umdapy server not running',
                });
                console.log(result);
                if (!result) return;

                await start_and_check_umdapy_with_toast();
            }
            dataFromPython = await computefromServer<T>({
                target,
                general,
                pyfile,
                args,
                cancelToken,
            });
            console.log(dataFromPython);
            if ((dataFromPython as any)?.warnings) {
                Alert.warn((dataFromPython as any).warnings);
            }
        }
        return Promise.resolve(dataFromPython);
    } catch (error) {
        Alert.error(error);
    } finally {
        if (processDivGeneral) {
            const num = processDivGeneral.textContent as string;
            processDivGeneralNum = isNaN(parseInt(num)) ? 0 : parseInt(num);
            const currentNum = processDivGeneralNum - 1;

            if (currentNum > 0) {
                processDivGeneral.textContent = `${currentNum}`;
            } else {
                processDivGeneral.textContent = '';
            }
        }
        console.log('COMPLETED');
    }
}
