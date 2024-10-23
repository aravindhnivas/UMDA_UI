import { io } from 'socket.io-client';
import { socket_connection_status, socket, jobStatus } from './stores';
import { pyServerPORT, pyServerReady, redis_server_mode } from '$lib/pyserver/stores';

export function initializeSocket() {
    if (!get(redis_server_mode)) return toast.error('Redis server mode is not enabled');
    if (!get(pyServerReady)) return toast.error('Python server is not ready yet');
    if (get(socket_connection_status) === 'connected') return toast.error('Already connected to server');

    if (get(socket)) {
        get(socket).disconnect();
    }

    const ws = io(`http://localhost:${get(pyServerPORT)}`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.set(ws);
    const $socket = get(socket);

    // Connection events
    $socket.on('connect', () => {
        console.log('WebSocket connected');
        socket_connection_status.set('connected');
    });

    $socket.on('connection_response', (data: any) => {
        console.log('Connection response:', data);
    });

    $socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        socket_connection_status.set('disconnected');
    });

    // Job-related events
    $socket.on('job_queued', (data: any) => {
        console.log('Job queued:', data);
        jobStatus.update(status => ({
            ...status,
            // [data.job_id]: { status: 'queued', ...data },
            [data.job_id]: { status: 'queued' },
        }));
    });

    $socket.on('job_started', (data: any) => {
        console.log('Job started:', data);
        jobStatus.update(status => ({
            ...status,
            // [data.job_id]: { status: 'running', ...data },
            [data.job_id]: { status: 'running' },
        }));
    });

    $socket.on('job_result', (data: any) => {
        console.log('Job result received:', data);
        jobStatus.update(status => ({
            ...status,
            [data.job_id]: { status: 'completed', result: data.result, done: true },
        }));
        // Trigger any callback or state update needed for your UI
    });

    $socket.on('job_error', (data: any) => {
        console.error('Job error:', data);
        jobStatus.update(status => ({
            ...status,
            [data.job_id]: { status: 'error', error: data.error, done: true },
        }));
    });

    // Error handling
    $socket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
        socket_connection_status.set('error');
    });

    $socket.on('connect_error', (error: any) => {
        console.error('Connection error:', error);
        socket_connection_status.set('error');
    });
}
