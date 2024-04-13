import { currentPortPID, updateServerInfo } from '$lib/pyserver/umdapyServer';
import { pyServerPORT, pyServerReady } from '$lib/pyserver/stores';
import { serverInfo } from './stores';
import { platform } from '@tauri-apps/api/os';
import { toast } from 'svelte-sonner';
import { Alert } from '$utils/stores';

const fail = (err: string | Object) => {
    serverInfo.error('failed to check network status');
    serverInfo.error(err);
    return false;
};

export const checkNetstat_execution = async () => {
    serverInfo.warn('checking server network status...');

    const args = {
        win32: ['-ano', '-p', 'tcp'],
        darwin: ['-i', `:${get(pyServerPORT)}`],
        linux: ['-i', `:${get(pyServerPORT)}`],
    };

    const currentplatform = (await platform()) as 'win32' | 'darwin' | 'linux';
    return new shell.Command(`netstat-${currentplatform}`, args[currentplatform]).execute();
};

export const checkNetstat = async () => {
    const [err, output] = await oO(checkNetstat_execution());
    // console.log(output, output?.stdout);
    if (output?.stdout) {
        output.stdout.split('\n').forEach(ln => {
            if (ln.includes('LISTEN') && ln.includes(`${get(pyServerPORT)}`)) {
                serverInfo.warn(ln);
            }
        });
        // serverInfo.warn(output.stdout)
    }
    if (!output) return console.error('no output');
    if (err || output.stderr) return fail(err || output.stderr);

    const currentplatform = (await platform()) as 'win32' | 'darwin' | 'linux';
    if (currentplatform !== 'win32') return true;

    const cond = (ln: string) => {
        if (ln.includes('TCP') && ln.includes('LISTEN') && ln.includes(`:${get(pyServerPORT)}`)) {
            return ln;
        }
    };

    const filtered_output = output.stdout.trim().split('\n').map(cond).filter(Boolean);
    serverInfo.warn(filtered_output.join('\n'));
    serverInfo.warn('network status check done!');
    return true;
};

export const killPID = async ({ update_info = true } = {}) => {
    const fullports = get(currentPortPID);

    if (fullports.length < 1) return toast.error('Enter PID in currentPortPID');
    serverInfo.warn('Closed unused PIDs:' + fullports);
    const kill = async (port: string) => {
        const args = {
            win32: ['/PID', port, '/F'],
            darwin: ['-9', port],
            linux: ['-9', port],
        };

        const currentplatform = (await platform()) as 'win32' | 'darwin' | 'linux';
        const command = currentplatform === 'win32' ? `taskkill-${await platform()}` : 'taskkill-darwin';
        // console.log(command, args[currentplatform]);
        const [_err, output] = await oO(new shell.Command(command, args[currentplatform]).execute());

        if (_err) return Alert.error(_err);
        currentPortPID.update(ports => ports.filter(p => p !== port));
        if (!output) return;

        if (output.stderr) {
            return serverInfo.error(output.stdout);
        }

        serverInfo.success(output.stdout);
    };

    for (const port of fullports) {
        await kill(port);
    }
    pyServerReady.set(false);
    if (update_info) await updateServerInfo();
};
