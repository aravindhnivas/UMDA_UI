import { path } from '@tauri-apps/api';
import type { Child } from '@tauri-apps/api/shell';
import { createPersistanceStore } from '$utils/index';
import { writable, derived } from 'svelte/store';
import { writable as persist } from '@macfja/svelte-persistent-store';
export { get } from 'svelte/store';

export const pythonpath = createPersistanceStore('python', 'pythonpath');
export const pythonscript = createPersistanceStore('', 'pythonscript');
export const umdapy = writable(import.meta.env.VITE_pypackage);

export const developerMode = writable(import.meta.env.DEV);
export const pyProgram = derived([developerMode, pythonpath, umdapy], ([$developerMode, $pythonpath, $umdapy]) => {
    return $developerMode ? $pythonpath : $umdapy;
});
export const pyServerReady = writable(false);
// export const port_lock = createPersistanceStore(false, 'port_lock');

export const pyVersion = writable('');
export const umdapyVersion = writable('');
export const pyServerPORT = createPersistanceStore(5051, 'pyServerPORT');
export const pyServerURL = derived(pyServerPORT, $pyServerPORT => `http://localhost:${$pyServerPORT}`);
export const mainpyfile = derived([developerMode, pythonscript], async ([$developerMode, $pythonscript]) => {
    return $developerMode ? await path.join($pythonscript, 'main.py') : '';
});

// export const currentTab = createPersistanceStore('Configuration', 'settingsActiveTab');
export const serverDebug = createPersistanceStore(false, 'serverDebug');
export const serverCurrentStatus = writable<OutputBoxtype>({ value: 'umdapy server not running', type: 'error' });

export const pyChildProcess = writable<Child>();
