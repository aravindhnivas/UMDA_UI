import { pyProgram, pythonscript, get, pyVersion, pyServerReady, developerMode } from './stores';
import { running_processes } from '$settings/utils/stores';
import { terminal_log } from '$settings/utils/stores';
import { Alert } from '$utils/stores';
import { tryF } from 'ts-try';

export const dispatchEvent = (target: HTMLButtonElement, detail: Object, eventName: string) => {
    if (!target) return console.warn('No target to dispatch event');
    const event = new CustomEvent(eventName, { bubbles: false, detail });
    target.dispatchEvent(event);
};

export const computepyfile = 'main.py';

interface ComputeFromSubprocessType {
    pyfile: string;
    args: Object;
    target: HTMLButtonElement;
}

export default async function <T>({ target, pyfile, args }: ComputeFromSubprocessType) {
    return new Promise(async (resolve, reject) => {
        if (!get(pyVersion)) {
            return reject('Python is not valid. Fix it in Settings --> Configuration');
        }

        console.info('Sending general arguments: ', args);

        const sendArgs = [pyfile, JSON.stringify(args)];
        const mainPyFile = await path.join(get(pythonscript), computepyfile);

        const pyArgs = get(developerMode) ? [mainPyFile, ...sendArgs] : sendArgs;
        console.log(get(pyProgram), pyArgs);

        const outputFile = await path.join(await path.appLogDir(), pyfile + '.json');
        console.info({ outputFile });

        const py = shell.Command.create(get(pyProgram), pyArgs);
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

        py.on('error', error => {
            console.error('error', error);
            dispatchEvent(target, { py, pyfile, error: error.message }, 'pyEventError');
            Alert.error(error);
            running_processes.mark_aborted(pyChild.pid);
        });

        let error = '';
        let dataReceived = '';
        dispatchEvent(target, { py, pyfile }, 'pyEvent');

        py.on('close', async () => {
            dispatchEvent(target, { py, pyfile, dataReceived, error }, 'pyEventClosed');
            running_processes.mark_completed(pyChild.pid);

            if (error) {
                if (error.includes('Traceback')) {
                    dispatchEvent(target, { py, pyfile, error }, 'pyEventError');
                    resolve(undefined);
                    running_processes.mark_aborted(pyChild.pid);
                    running_processes.add_logs(pyChild.pid, error);
                    return Alert.error(error);
                }
                running_processes.add_logs(pyChild.pid, error + '\n\n' + dataReceived);
            }

            if (!(await fs.exists(outputFile))) {
                dispatchEvent(target, { py, pyfile, error: 'Output file not found' }, 'pyEventError');
                console.warn(`${outputFile} file doesn't exists`);
                return resolve(undefined);
            }

            console.info('Reading output file');
            const [_err, output] = await oO(fs.readTextFile(outputFile));
            if (_err) return Alert.error(_err);

            console.info('Output file read successfully and now parsing it');

            const dataFromPython = tryF(() => JSON.parse(output ?? '')) as T & {
                done: boolean;
                error: boolean;
                computed_time: string;
            };
            if (dataFromPython instanceof Error) {
                console.warn('Error parsing data from python', dataFromPython);
                resolve(undefined);
                return Alert.error(dataFromPython);
            }

            toast.info('Data parsed successfully');
            console.log('Data received from python: ', dataFromPython);
            toast.success(`${pyfile} completed in ${dataFromPython.computed_time}`);
            dispatchEvent(target, { py, pyfile, dataFromPython }, 'pyEventSuccess');
            console.warn('Process completed and returning data');
            return resolve(dataFromPython);
        });

        py.stderr.on('data', errorString => {
            error += errorString;
            dispatchEvent(target, { py, pyfile, stderr: errorString }, 'pyEventStderr');
            if (errorString.includes('INFO')) terminal_log.info(errorString);
            else if (errorString.includes('WARNING')) terminal_log.warn(errorString);
            else if (errorString.includes('ERROR')) terminal_log.error(errorString);
            else terminal_log.info(errorString);
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
            dispatchEvent(target, { py, pyfile, dataReceived, stdout: dataString }, 'pyEventStdout');
        });
    });
}
