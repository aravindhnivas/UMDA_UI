import { serverInfo } from '$pages/settings/utils/stores';
export const wsready = writable(false);
export const wsport = writable_store('wsport', 8765);

let socket: WebSocket;

export const connect_websocket = () => {
    serverInfo.info('Connecting to Python server...');
    if (socket) {
        serverInfo.warn('Closing existing connection...');
        socket.close();
        wsready.set(false);
    }

    socket = new WebSocket(`ws://localhost:${get(wsport)}`);

    // socket.onmessage = event => {
    //     // console.log(`Received from Python: ${event.data}`);
    //     // Send message back to Python server
    //     socket.send('Hello from JavaScript!');
    // };

    socket.onopen = () => {
        wsready.set(true);
        serverInfo.info('Connected to Python server!');
        // console.log('Connected to Python server!');
        // Send initial message to Python server
        socket.send('Hello from JavaScript!');
    };

    socket.onerror = error => {
        serverInfo.error('Error occurred!' + error);
        console.error('Error occurred:', error);
    };

    socket.onclose = () => {
        wsready.set(false);
        serverInfo.warn('Disconnected from Python server!');
        console.log('Disconnected from Python server!');
    };

    return socket;
};

export const stop_websocket = () => {
    serverInfo.info('Closing connection...');
    if (!socket) {
        serverInfo.info('No connection to close!');
        return;
    }
    socket.close();
    wsready.set(false);
    serverInfo.info('Connection closed!');
};
