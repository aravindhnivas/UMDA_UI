import { Socket } from 'socket.io-client';

export const jobStatus = writable<Record<string, JobStatusType>>({});
export const socket = writable<Socket>();
export const socket_connection_status = writable('disconnected');
