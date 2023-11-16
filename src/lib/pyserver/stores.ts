import { path } from '@tauri-apps/api';
import type { Child } from '@tauri-apps/api/shell';
import { createPersistanceStore } from '$utils/index';
import { writable, derived, type Writable } from 'svelte/store';

export { get } from 'svelte/store';

export const pythonpath = createPersistanceStore('python', 'pythonpath');
export const pythonscript = createPersistanceStore('', 'pythonscript');
export const umdapy = writable(import.meta.env.VITE_python_package_ID ?? 'umdapy');

export const developerMode = writable(import.meta.env.DEV);
export const pyProgram = derived([developerMode, pythonpath, umdapy], ([$developerMode, $pythonpath, $umdapy]) => {
    return $developerMode ? $pythonpath : $umdapy;
});
export const pyServerReady = writable(false);
export const port_lock = createPersistanceStore(false, 'port_locl');

export const pyVersion = writable('');
export const umdapyVersion = writable('');
export const pyServerPORT = createPersistanceStore(5050, 'pyServerPORT');
export const mainpyfile = derived([developerMode, pythonscript], async ([$developerMode, $pythonscript]) => {
    return $developerMode ? await path.join($pythonscript, 'main.py') : '';
});

// export const currentTab = createPersistanceStore('Configuration', 'settingsActiveTab');
export const serverDebug = createPersistanceStore(false, 'serverDebug');
export const serverCurrentStatus = createPersistanceStore<OutputBoxtype>(
    { value: '', type: 'info' },
    'serverCurrentStatus',
);

export const pyChildProcess = writable<Child | null>(null);
