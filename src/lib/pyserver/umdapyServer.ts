import {
    pyProgram,
    serverDebug,
    pyServerReady,
    developerMode,
    pyServerPORT,
    pythonscript,
    pyChildProcess,
    serverCurrentStatus,
    pyServerURL,
    pyVersion,
} from '$lib/pyserver/stores';
import { serverInfo } from '$settings/utils/stores';
import { python_asset_ready } from '$settings/utils/stores';
import { checkNetstat, checkNetstat_execution, killPID } from '$settings/utils/network';
import type { Child } from '@tauri-apps/api/shell';
import { getPyVersion } from '$settings/utils/checkPython';
import { sleep } from '$lib/utils/initialise';
import { Alert } from '$utils/stores';
import { check_umdapy_assets_status } from '$pages/settings/utils/assets-status';

export const currentPortPID = localWritable<string[]>('pyserver-pid', []);

export async function startServer() {
    if (!get(developerMode) && !get(python_asset_ready)) return serverInfo.error('python asset not ready');
    if (get(pyServerReady)) return toast.warning('server already running');
    serverInfo.warn('starting umdapy server at port: ' + get(pyServerPORT));
    if (get(currentPortPID).length > 0) {
        const killedports = await killPID(get(currentPortPID));
        if (typeof killedports === 'object') currentPortPID.set(killedports);
        pyServerReady.set(false);
        await updateServerInfo();
    }

    pyServerReady.set(false);
    const pyfile = 'server';
    const sendArgs = [pyfile, JSON.stringify({ port: get(pyServerPORT), debug: get(serverDebug) })];
    const mainPyFile = await path.join(get(pythonscript), 'main.py');

    const pyArgs = get(developerMode) ? [mainPyFile, ...sendArgs] : sendArgs;
    console.log(get(pyProgram), pyArgs);
    const py = new shell.Command(get(pyProgram), pyArgs);

    const [err, pyChild] = await oO<Child, string>(py.spawn());
    if (err) {
        toast.error(err);
        return Promise.reject(err);
    }
    if (!pyChild) return Promise.reject('pyChild not found');

    pyChildProcess.set(pyChild);
    currentPortPID.update(ports => [...ports, `${pyChild.pid}`]);

    py.on('close', () => {
        pyServerReady.set(false);
        currentPortPID.update(ports => ports.filter(p => p !== `${get(pyChildProcess)?.pid}`)); // remove pid from list
        serverInfo.warn('server closed');
    });

    py.on('error', error => {
        Alert.error(error);
        serverInfo.error(error);
        pyServerReady.set(false);
        return Promise.reject(error);
    });

    py.stderr.on('data', async stderr => {
        if (!stderr.trim()) return;
        serverInfo.warn(stderr.trim());

        if (stderr.includes('Server running')) {
            pyServerReady.set(true);
            serverInfo.info(`PID: ${JSON.stringify(get(currentPortPID))}`);
            await updateServerInfo(1500);
            if (get(pyServerReady)) {
                const [err] = await oO(getPyVersion());
                // if (err) return Promise.reject(err);
            }
            // return Promise.resolve(get(pyServerReady));
        }
    });

    py.stdout.on('data', stdout => {
        if (!stdout.trim()) return;
        serverInfo.info(stdout.trim());
    });

    return Promise.resolve('server started');
}

export async function stopServer({ update_info = true } = {}) {
    try {
        if (!get(pyServerReady)) {
            await killPID(get(currentPortPID));
            pyServerReady.set(false);
            if (update_info) await updateServerInfo();
            return;
        }
        if (!get(pyChildProcess)?.kill) return serverInfo.error('pyChildProcess not found');
        await get(pyChildProcess)?.kill();

        pyServerReady.set(false);
        if (update_info) await updateServerInfo();

        return Promise.resolve(true);
    } catch (error) {
        if (error instanceof Error) {
            Alert.error(error);
        }
    }
}

export async function checkServerProblem() {
    if (!get(pyServerReady)) {
        return await start_and_check_umdapy_with_toast();
    }

    const [err, rootpage] = await oO(axios.get<string>(`${get(pyServerURL)}/${import.meta.env.VITE_pypackage}`));
    if (err) return serverInfo.error(`failed to fetch rootpage /`);

    // if (!rootpage) return;
    // if (!rootpage.data.includes('umdapy')) {
    //     return await dialog.message('Change port in settings-->configuration and restart server');
    // }

    const [err1] = await oO(getPyVersion());
    if (!err1) return toast.success('Problem fixed');

    const [err2, output] = await oO(checkNetstat_execution(get(pyServerPORT)));
    if (err2) {
        toast.error('failed to get netstat');
        return;
    }
    if (!output) return;
    const stdout = output.stdout.trim();
    if (!stdout) return;

    const cond = (ln: string) => {
        if (ln.includes('TCP') && ln.includes('LISTEN') && ln.includes(`:${get(pyServerPORT)}`)) {
            return ln;
        }
    };
    const filtered_output = stdout.split('\n').map(cond).filter(Boolean);
    if (filtered_output.length > 0) {
        await dialog.message(
            'Type the listening PID in currentPORTPID (press enter) as shown in the SERVER OUTPUT and click on killPID',
        );
    }
}

export const fetchServerROOT = async (delay = 0) => {
    if (delay > 0) await sleep(delay);

    const URL = `${get(pyServerURL)}/${import.meta.env.VITE_pypackage}`;

    serverInfo.info(`fetching rootpage ${URL}`);
    const rootpage = await axios.get<string>(URL);

    if (!rootpage) return serverInfo.error(`failed to fetch rootpage /${import.meta.env.VITE_pypackage}`);

    pyServerReady.set(true);

    serverInfo.success(rootpage.data);
    serverCurrentStatus.set({ value: `server running: port(${get(pyServerPORT)})`, type: 'success' });

    if (!get(pyVersion)) {
        const [err] = await oO(getPyVersion());
        if (err) return serverInfo.error(err);
    }
};

export const updateServerInfo = async (delay = 0) => {
    serverCurrentStatus.set({ value: 'checking server status...', type: 'info' });
    serverInfo.info(get(serverCurrentStatus).value);

    if (delay > 0) await sleep(delay);

    if (!get(pyServerReady)) {
        serverCurrentStatus.set({ value: 'server closed', type: 'error' });
        return;
    }
    const status = await checkNetstat(get(pyServerPORT));
    if (!status) {
        return serverCurrentStatus.set({ value: 'server closed', type: 'error' });
    }

    await fetchServerROOT(delay);
};

export const start_and_check_umdapy = () => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!get(developerMode) && !get(python_asset_ready)) {
                await check_umdapy_assets_status();
                if (!get(python_asset_ready)) {
                    serverInfo.error('umdapy is not installed. Maybe check-umdapy-assets?');
                    return reject('umdapy is not installed. Maybe check-umdapy-assets?');
                }
            }

            await startServer();
            resolve(get(pyServerReady));
            // serverInfo.info(`PID: ${JSON.stringify(get(currentPortPID))}`);
            // await updateServerInfo(1500);
            // if (get(pyServerReady)) {
            //     const [err] = await oO(getPyVersion());
            //     if (err) return reject(err);
            // }
            // resolve(get(pyServerReady));
        } catch (error) {
            if (error instanceof Error) {
                reject(error);
                serverInfo.error(error?.message ?? 'failed to start umdapy server');
            }
        }
    });
};

export const start_and_check_umdapy_with_toast = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await start_and_check_umdapy();
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
    // toast.promise(start_and_check_umdapy(), {
    //     loading: 'starting umdapy server',
    //     success: 'umdapy server started',
    //     error: 'failed to start umdapy server',
    // });
};
