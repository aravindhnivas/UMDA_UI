import computePy from '$lib/pyserver/computePy';
import { serverInfo } from '$pages/settings/utils/stores';

export const wsready = writable(false);
export const wsport = localWritable('wsport', 8765);
export const socket = writable<WebSocket>();
export const ws_readyState = {
    0: 'CONNECTING',
    1: 'OPEN',
    2: 'CLOSING',
    3: 'CLOSED',
};

export const connect_websocket = () => {
    if (get(socket)) serverInfo.info('ReadyState onstart: ' + ws_readyState[get(socket).readyState]);
    if (get(socket)?.readyState === 1) {
        get(socket).send('Hello from UMDA UI!');
        return serverInfo.info('Already connected to Python server!');
    }

    socket.set(new WebSocket(`ws://localhost:${get(wsport)}`));
    serverInfo.info('ReadyState: ' + ws_readyState[get(socket).readyState]);

    get(socket).onopen = () => {
        wsready.set(true);
        serverInfo.info('Connected to Python server!');
        get(socket).send('Hello from UMDA UI!');
    };

    get(socket).onmessage = message => {
        serverInfo.info('Message received from Python server: ' + message.data);
    };

    get(socket).onerror = error => {
        serverInfo.error('Error occurred!' + JSON.stringify(error, null, 2));
    };

    get(socket).onclose = () => {
        wsready.set(false);
        serverInfo.warn('Disconnected from Python server!');
        serverInfo.info('ReadyState onclose: ' + ws_readyState[get(socket).readyState]);
    };
};

export const stop_websocket = async () => {
    serverInfo.info('Closing connection...');
    if (!get(socket)) {
        serverInfo.info('No connection to close!');
        return;
    }
    get(socket).close();
    wsready.set(false);
    serverInfo.info('Connection closed!');

    try {
        await computePy({
            pyfile: 'ws',
            args: { wsport: get(wsport), action: 'stop' },
            general: true,
        });
        serverInfo.info('Python server stopped!');
    } catch (error) {
        serverInfo.error('Error stopping Python server!' + error);
    }
};
