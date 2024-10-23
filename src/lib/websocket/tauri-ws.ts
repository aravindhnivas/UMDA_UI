import WebSocket from 'tauri-plugin-websocket-api';
import { pyProgram, developerMode, pythonscript, pyServerPORT } from '$lib/pyserver/stores';
import { serverInfo } from '$settings/utils/stores';
import type { Child } from '@tauri-apps/api/shell';
import { Alert } from '$utils/stores';

export const ws = writable<WebSocket | null>(null);
export const wsport = localWritable('wsport', 8765);
export const wsready = writable(false);

export async function connect_ws() {
    let $ws = get(ws);
    if ($ws || get(wsready)) return toast.error('Websocket already connected');
    try {
        // const conn = await WebSocket.connect(`ws://localhost:${get(wsport)}/pyfile`);
        const conn = await WebSocket.connect(
            `ws://localhost:${get(pyServerPORT)}/socket.io/?EIO=4&transport=websocket`,
        );
        ws.set(conn);
        wsready.set(true);
    } catch (error) {
        console.error(error, typeof error);
        toast.error('Websocket connection error' + error);
        wsready.set(false);
    }
    $ws = get(ws);
    if (!$ws) return toast.error('Websocket not connected');
    toast.success('Websocket connected');

    await $ws.addListener(message => {
        if (message.type === 'Ping') return;
        if (message.type === 'Close') {
            console.warn('Websocket closed');
            ws.set(null);
            wsready.set(false);
            return toast.error('Websocket closed');
        }
        console.warn('Received message:', message);
        toast.info('Received message: ' + message.data);
        console.log(JSON.parse(message.data as string));
    });
}
export async function disconnect_ws() {
    let $ws = get(ws);
    if (!$ws) return;
    await $ws.disconnect();
    console.warn('Websocket disconnected');
    ws.set(null);
    wsready.set(false);
}

const server_started_keyword = 'WebSocket server started';
export async function send_msg_ws(msg: Record<string, any>) {
    let $ws = get(ws);
    if (!$ws) return;
    if (!isObject(msg)) return toast.error('Invalid message. Must be an object');
    await $ws.send(JSON.stringify(msg));
}

export async function startServerWS(e: Event) {
    if (get(developerMode) && !(await fs.exists(get(pythonscript)))) {
        toast.error('pythonscript not found. Please set python source file in settings');
        return serverInfo.error('pythonscript not found');
    }
    if (get(wsready) && get(ws)) return toast.warning('server already running');

    wsready.set(false);

    const pyfile = 'websocket';
    const sendArgs = [pyfile, JSON.stringify({ wsport: get(wsport) })];
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

    let full_stderr = '';
    const target_btn = e.currentTarget as HTMLButtonElement;
    // console.log({ target_btn });
    if (target_btn) {
        if (!target_btn.classList.contains('running')) target_btn.classList.add('running');
    }
    py.on('close', async () => {
        serverInfo.warn('server closed');

        if (full_stderr.includes('Traceback (most recent call last):')) {
            const last_traceback =
                '\nTraceback (most recent call last):' + full_stderr.split('Traceback (most recent call last):').pop();
            console.log(last_traceback);
            serverInfo.error(last_traceback);
            serverInfo.error('Server closed with error');
            if (target_btn) {
                if (target_btn.classList.contains('running')) target_btn.classList.remove('running');
            }
            await disconnect_ws();
        }
    });

    py.on('error', error => {
        console.error(error);
        Alert.error(error);
        serverInfo.error(error);
    });

    py.stderr.on('data', async stderr => {
        if (!stderr.trim()) return;
        full_stderr += stderr;
        serverInfo.warn(stderr.trim());
        if (stderr.includes(server_started_keyword)) {
            if (target_btn) {
                if (target_btn.classList.contains('running')) target_btn.classList.remove('running');
            }
            await connect_ws();
        }
    });

    py.stdout.on('data', stdout => {
        if (!stdout.trim()) return;
        serverInfo.info(stdout.trim());
    });

    return Promise.resolve('server started');
}

export async function stopServerWS() {
    const $ws = get(ws);
    if (!$ws) return;
    await $ws.send('stop');
}
