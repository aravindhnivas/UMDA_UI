import { pyProgram, pythonscript, get, pyVersion, pyServerReady, developerMode } from './stores';
import { running_processes } from '$settings/utils/stores';
import { path, shell } from '@tauri-apps/api';
import { terminal_log } from '$settings/utils/stores';
import { Alert } from '$utils/stores';
import { tryF } from 'ts-try';
import { appLogDir } from '@tauri-apps/api/path';

export const dispatchEvent = (target: HTMLButtonElement | null | undefined, detail: Object, eventName: string) => {
    if (!target) return console.warn('No target to dispatch event');
    const event = new CustomEvent(eventName, { bubbles: false, detail });
    target.dispatchEvent(event);
};

interface Type {
    pyfile: string;
    args: Object;
    target?: HTMLButtonElement | null;
    e?: Event;
    button?: HTMLButtonElement | null;
    computepyfile?: string;
    detached?: boolean;
}

export default async function <T>({
    e,
    target,
    button,
    pyfile,
    args,
    computepyfile = 'main',
}: Type): Promise<T | string | undefined> {
    return new Promise(async resolve => {
        target ||= button || (e?.target as HTMLButtonElement);

        if (!get(pyVersion)) {
            Alert.error('Python is not valid. Fix it in Settings --> Configuration');
            return;
        }

        console.info('Sending general arguments: ', args);
        toast('Process Started');

        const sendArgs = [pyfile, JSON.stringify(args)];
        const mainPyFile = await path.join(get(pythonscript), computepyfile + '.py');

        const pyArgs = get(developerMode) ? [mainPyFile, ...sendArgs] : sendArgs;
        console.log(get(pyProgram), pyArgs);

        const outputFile = await path.join(await appLogDir(), pyfile + '.json');
        console.info({ outputFile });

        const py = new shell.Command(get(pyProgram), pyArgs);
        const pyChild = await py.spawn();

        const current_process = {
            pyfile,
            close: {
                name: 'X',
                cb: async () => await pyChild.kill(),
                style: 'display:flex; justify-content: center; cursor: pointer; background-color: red;',
            },
        };
        running_processes.add(pyChild.pid, current_process);

        py.on('error', err => {
            Alert.error(err);
            running_processes.mark_aborted(pyChild.pid);
        });

        let error = '';
        let dataReceived = '';
        dispatchEvent(target, { py, pyfile }, 'pyEvent');

        py.on('close', async () => {
            console.warn('Before closing process');

            dispatchEvent(target, { py, pyfile, dataReceived, error }, 'pyEventClosed');
            console.info('PyEventClosed dispatched');

            running_processes.mark_completed(pyChild.pid);

            if (error) {
                resolve(undefined);
                if (error.includes('Traceback')) {
                    running_processes.mark_aborted(pyChild.pid);
                    running_processes.add_logs(pyChild.pid, error);
                    return Alert.error(error);
                }
                running_processes.add_logs(pyChild.pid, error + '\n\n' + dataReceived);
            }

            if (!(await fs.exists(outputFile))) {
                console.warn(`${outputFile} file doesn't exists`);
                return resolve(undefined);
            }

            console.info('Reading output file');
            const [_err, output] = await oO(fs.readTextFile(outputFile));
            if (_err) return Alert.error(_err);

            console.info('Output file read successfully and now parsing it');
            const dataFromPython = tryF(() => JSON.parse(output ?? ''));
            if (dataFromPython instanceof Error) {
                console.warn('Error parsing data from python', dataFromPython);
                resolve(undefined);
                return Alert.error(dataFromPython);
            }

            toast.info('Data parsed successfully');
            console.log('Data received from python: ', dataFromPython);
            toast.success('Process Completed');
            return resolve(dataFromPython);
        });

        py.stderr.on('data', errorString => {
            error += errorString;
            dispatchEvent(target, { py, pyfile, error }, 'pyEventStderr');
            terminal_log.warn(errorString);
        });

        py.stdout.on('data', dataString => {
            dataReceived += dataString;

            const match = dataString.match(/(\d+)% Completed/);
            if (match) {
                const percentage_completed = parseInt(match[1], 10);
                running_processes.update_progress(pyChild.pid, percentage_completed);
            } else {
                terminal_log.info(dataString);
            }
            dispatchEvent(target, { py, pyfile, dataReceived, stdout: dataString }, 'pyEventData');
        });
    });
}
