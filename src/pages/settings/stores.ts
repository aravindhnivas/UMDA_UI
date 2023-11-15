import { createPersistanceStore } from '$utils/index';
export const active_settings_tab = createPersistanceStore('Configuration', 'active_settings_tab');

export const developer_mode = createPersistanceStore(true, 'developer_mode');
export const port_lock = createPersistanceStore(false, 'port_lock');
export const server = createPersistanceStore<{
    status: 'error' | 'success';
    port: number;
    pid: number | null;
}>(
    {
        status: 'error',
        port: 5050,
        pid: null,
    },
    'server',
);
