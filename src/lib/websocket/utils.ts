import { io } from 'socket.io-client';
import { socket_connection_status, socket, jobStatus } from './stores';
import { pyServerPORT, pyServerReady, redis_server_mode } from '$lib/pyserver/stores';
import { Alert } from '$utils/stores';

function remove_job_from_status(job_id: string, timeout: number = 600000) {
    setTimeout(() => {
        console.warn('Job removed from status:', job_id, get(jobStatus));
        jobStatus.update(status => {
            delete status[job_id];
            return status;
        });
    }, timeout);
}

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
            [data.job_id]: { status: 'queued' },
        }));
    });

    $socket.on('job_started', (data: any) => {
        console.log('Job started:', data);
        jobStatus.update(status => ({
            ...status,
            [data.job_id]: { status: 'running' },
        }));
    });

    $socket.on('job_result', (data: any) => {
        console.log('Job result received:', data);
        jobStatus.update(status => ({
            ...status,
            [data.job_id]: { status: 'completed', result: data.result, done: true },
        }));
        remove_job_from_status(data.job_id);
    });

    $socket.on('job_error', (data: any) => {
        console.error('Job error:', data);
        Alert.error(data.error);
        jobStatus.update(status => ({
            ...status,
            [data.job_id]: { status: 'error', error: data.error, done: true },
        }));
        remove_job_from_status(data.job_id, 30000);
    });

    $socket.on('job_cancelled', (data: any) => {
        console.log('Job cancelled:', data);
        jobStatus.update(status => ({
            ...status,
            [data.job_id]: { status: 'cancelled', message: data.message, done: true },
        }));
        remove_job_from_status(data.job_id);
    });

    $socket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
        socket_connection_status.set('error');
    });

    $socket.on('connect_error', (error: any) => {
        console.error('Connection error:', error);
        socket_connection_status.set('error');
    });
}
