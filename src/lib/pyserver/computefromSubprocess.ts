import { pyProgram, pythonscript, get, pyVersion, pyServerReady, developerMode } from './stores';
import { running_processes } from '$settings/utils/stores';
import { path, fs, shell } from '@tauri-apps/api';
import { terminal_log } from '$settings/utils/stores';
import { Alert } from '$utils/stores';
import { tryF } from 'ts-try';
import { get_tmpdir } from '$utils/index';

export const dispatchEvent = (target: HTMLButtonElement | null | undefined, detail: Object, eventName: string) => {
    if (!target) return console.warn('No target to dispatch event');
    const event = new CustomEvent(eventName, { bubbles: false, detail });
    target.dispatchEvent(event);
    // console.info(eventName + ' dispatched')
};

interface Type {
    pyfile: string;
    args: Object;
    target?: HTMLButtonElement | null;
    general?: boolean;
    e?: Event;
    button?: HTMLButtonElement | null;
    computepyfile?: string;
    detached?: boolean;
}

export default async function <T>({
    e,
    target,
    button,
    general = false,
    pyfile,
    args,
    computepyfile = 'main',
}: Type): Promise<T> {
    return new Promise(async resolve => {
        let outputFile: string;
        target ||= button || (e?.target as HTMLButtonElement);

        console.log({ target });

        if (pyfile === 'server') {
            pyServerReady.set(false);
        }

        if (!general) {
            const filename = pyfile.split('.').at(-1) + '_data.json';
            const tempdirPath = await get_tmpdir();
            const outputFile = await path.join(tempdirPath, filename);
            if (await fs.exists(outputFile)) {
                const [_err] = await oO(fs.removeFile(outputFile));
                if (_err) console.error(_err);
            }
            target?.classList.toggle('is-loading');
        }

        // pyVersion.set(localStorage.getItem('pyVersion'))
        if (!get(pyVersion)) {
            Alert.error('Python is not valid. Fix it in Settings --> Configuration');
            return;
        }

        console.info('Sending general arguments: ', args);
        toast('Process Started');

        const sendArgs = [pyfile, JSON.stringify(args)];
        const mainPyFile = await path.join(get(pythonscript), computepyfile + '.py');

        // const command_suffix = get(developerMode) ? '-dev' : ''
        const pyArgs = get(developerMode) ? [mainPyFile, ...sendArgs] : sendArgs;
        // const cmd = `umdapy${command_suffix}`
        console.log(get(pyProgram), pyArgs);
        const py = new shell.Command(get(pyProgram), pyArgs);
        const pyChild = await py.spawn();

        if (pyfile !== 'server') {
            running_processes.update(p => [
                ...p,
                {
                    pid: pyChild.pid,
                    pyfile,
                    close: {
                        name: 'X',
                        cb: async () => await pyChild.kill(),
                        style: 'display:flex; justify-content: center; cursor: pointer; background-color: red;',
                    },
                    progress: null,
                },
            ]);
        }

        let ind = get(running_processes).findIndex(p => p.pid === pyChild.pid);

        py.on('error', err => {
            Alert.error(err);

            if (pyfile !== 'server') {
                running_processes.update(p => p.filter(p => p.pid !== pyChild.pid));
            }
            return;
        });

        let error = '';
        let dataReceived = '';
        dispatchEvent(target, { py, pyfile }, 'pyEvent');

        py.on('close', async () => {
            if (pyfile === 'server') {
                pyServerReady.set(false);
            }

            dispatchEvent(target, { py, pyfile, dataReceived, error }, 'pyEventClosed');
            if (pyfile !== 'server') {
                running_processes.update(p => p.filter(p => p.pid !== pyChild.pid));
            }

            if (error) {
                resolve(undefined);
                // loginfo.write(`\n\n[ERROR OCCURED]\n${error}\n`)
                // loginfo.end()

                if (error.includes('Traceback')) {
                    return Alert.error(error);
                }
                return console.error(error);
            }

            if (general) {
                return resolve(dataReceived);
            }

            if (!(await fs.exists(outputFile))) {
                console.warn(`${outputFile} file doesn't exists`);
                Alert.error(`${outputFile} file doesn't exists`);
                return resolve(undefined);
            }

            const [_err, output] = await oO(fs.readTextFile(outputFile));
            if (_err) return Alert.error(_err);

            const dataFromPython = tryF(() => JSON.parse(output));
            if (dataFromPython instanceof Error) {
                resolve(undefined);
                return Alert.error(dataFromPython);
            }
            resolve(dataFromPython);

            if (target?.classList.contains('is-loading')) {
                target.classList.remove('is-loading');
            }
            console.info('Process closed');
        });

        py.stderr.on('data', errorString => {
            // const errorString = `${String.fromCharCode.apply(null, err)}\n`
            if (pyfile === 'server') {
                error = errorString;
            } else {
                error += errorString;
            }
            dispatchEvent(target, { py, pyfile, error }, 'pyEventStderr');
            // console.log(`Output from python: ${errorString}`);
            terminal_log.warn(errorString);
        });

        py.stdout.on('data', dataString => {
            // loginfo.write(dataString)
            // const dataString = `${String.fromCharCode.apply(null, data)}\n`
            if (pyfile === 'server') {
                dataReceived = dataString;
            } else {
                dataReceived += dataString;
            }
            terminal_log.info(dataString);
            const match = dataString.match(/(\d+)% Completed/);
            if (match) {
                const percentage_completed = parseInt(match[1], 10);
                // console.log(`Percentage completed: ${percentage_completed}%`);
                running_processes.update(p => {
                    const current = p.find(p => p.pid === pyChild.pid);
                    if (current) {
                        current.progress = percentage_completed;
                    }
                    return p;
                });
            }
            // console.log(dataString.trim());
            dispatchEvent(target, { py, pyfile, dataReceived, stdout: dataString }, 'pyEventData');
        });

        if (pyfile === 'server') {
            pyServerReady.set(true);
        }
    });
}
