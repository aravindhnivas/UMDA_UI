import { terminal_log } from '$pages/settings/utils/stores';
export const wsready = writable(false);
export const wsport = writable(8765);

export const make_ws = () => {
    const socket = new WebSocket(`ws://localhost:${get(wsport)}`);

    socket.onmessage = event => {
        console.log(`Received from Python: ${event.data}`);
        // Send message back to Python server
        socket.send('Hello from JavaScript!');
    };

    socket.onopen = () => {
        wsready.set(true);

        terminal_log.info('Connected to Python server!');
        console.log('Connected to Python server!');
        // Send initial message to Python server
        socket.send('Hello from JavaScript!');
    };

    socket.onerror = error => {
        console.error('Error occurred:', error);
    };

    socket.onclose = () => {
        wsready.set(false);
        terminal_log.warn('Disconnected from Python server!');
        console.log('Disconnected from Python server!');
    };
    return socket;
};
