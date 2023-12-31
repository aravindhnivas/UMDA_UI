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
} from '$lib/pyserver/stores';
import { serverInfo } from '$settings/utils/stores';
import { python_asset_ready } from '$settings/utils/stores';
import { checkNetstat, checkNetstat_execution, killPID } from '$settings/utils/network';
import type { Child } from '@tauri-apps/api/shell';
import { getPyVersion } from '$settings/utils/checkPython';
import { createPersistanceStore } from '$utils/index';
import { sleep } from '$lib/utils/initialise';
import { toggle_loading } from '$utils/index';
import { Alert } from '$utils/stores';

export const currentPortPID = createPersistanceStore<string[]>([], 'pyserver-pid');

export async function startServer() {
    if (!get(developerMode) && !get(python_asset_ready)) return serverInfo.error('python asset not ready');
    if (get(pyServerReady)) return toast.warning('server already running');
    serverInfo.warn('starting umdapy server at port: ' + get(pyServerPORT));

    if (get(currentPortPID).length > 0) {
        await killPID();
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
    if (!pyChild) return;

    pyChildProcess.set(pyChild);
    pyServerReady.set(true);
    currentPortPID.update(ports => [...ports, `${pyChild.pid}`]);

    py.on('close', () => {
        pyServerReady.set(false);

        currentPortPID.update(ports => ports.filter(p => p !== `${get(pyChildProcess)?.pid}`)); // remove pid from list
        serverInfo.warn('server closed');
    });

    py.on('error', error => {
        Alert.error(error);
        serverInfo.error(error);
    });

    py.stderr.on('data', stderr => {
        if (!stderr.trim()) return;
        serverInfo.warn(stderr.trim());
    });

    py.stdout.on('data', stdout => {
        if (!stdout.trim()) return;
        serverInfo.info(stdout.trim());
    });

    return Promise.resolve('server started');
}

export async function stopServer({ update_info = true } = {}) {
    try {
        if (!get(pyServerReady)) return await killPID({ update_info });
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

    const [err, rootpage] = await oO(
        axios.get<string>(`${get(pyServerURL)}/${import.meta.env.VITE_pypackage}`),
    );
    if (err) return serverInfo.error(`failed to fetch rootpage /`);

    // if (!rootpage) return;
    // if (!rootpage.data.includes('umdapy')) {
    //     return await dialog.message('Change port in settings-->configuration and restart server');
    // }

    const [err1] = await oO(getPyVersion());
    if (!err1) return toast.success('Problem fixed');

    const [err2, output] = await oO(checkNetstat_execution());
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
    const [_err, rootpage] = await oO(axios.get<{ data: string }>(URL));
    
    if (_err) return serverInfo.error(`failed to fetch rootpage /${import.meta.env.VITE_pypackage}`);
    if (!rootpage) return;
    pyServerReady.set(true);

    serverInfo.success(rootpage.data);
    serverCurrentStatus.set({ value: `server running: port(${get(pyServerPORT)})`, type: 'success' });
};

export const updateServerInfo = async (delay = 0) => {
    serverCurrentStatus.set({ value: 'checking server status...', type: 'info' });
    serverInfo.info(get(serverCurrentStatus).value);

    if (delay > 0) await sleep(delay);

    if (!get(pyServerReady)) {
        serverCurrentStatus.set({ value: 'server closed', type: 'error' });
        return;
    }
    const status = await checkNetstat();
    if (!status) {
        return serverCurrentStatus.set({ value: 'server closed', type: 'error' });
    }
    await fetchServerROOT(delay);
};
export const start_and_check_umdapy = () =>
    new Promise(async (resolve, reject) => {
        const startServerBtn = document.getElementById('startServerButton') as HTMLButtonElement;
        try {
            if (!get(developerMode) && !get(python_asset_ready)) {
                serverInfo.error('umdapy is not installed. Maybe check-umdapy-assets?');
                return reject('umdapy is not installed. Maybe check-umdapy-assets?');
            }
                
            const out = await startServer();
            if (out) serverInfo.info(out);
            serverInfo.info(`PID: ${JSON.stringify(get(currentPortPID))}`);
            await updateServerInfo(1500);
            if (get(pyServerReady)) {
                const [err] = await oO(getPyVersion());
                if (err) return reject(err);
            }
            resolve(get(pyServerReady));
        } catch (error) {
            if (error instanceof Error) {
                reject(error);
                serverInfo.error(error?.message ?? 'failed to start umdapy server');
            }
        }
    });

export const start_and_check_umdapy_with_toast = () => {
    toast.promise(start_and_check_umdapy(), {
        loading: 'starting umdapy server',
        success: 'umdapy server started',
        error: 'failed to start umdapy server',
    });
};
