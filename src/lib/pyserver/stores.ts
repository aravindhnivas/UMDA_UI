import type { Child } from '@tauri-apps/api/shell';
export { get } from 'svelte/store';

export const pythonpath = localWritable('pythonpath', 'python');
export const pythonscript = localWritable('pythonscript', '');
export const umdapy = writable(import.meta.env.VITE_pypackage);

export const developerMode = writable(import.meta.env.DEV);

export const pyProgram = derived([developerMode, pythonpath, umdapy], ([$developerMode, $pythonpath, $umdapy]) => {
    return $developerMode ? $pythonpath : $umdapy;
});

export const pyServerReady = writable(false);
export const pyServerFailed = writable(false);
// export const port_lock = localWritable('port_lock', false);

export const pyVersion = writable('');
export const umdapyVersion = writable('');
export const pyServerPORT = localWritable('pyServerPORT', 5051);
export const use_server = writable(false);
export const cloudServerURL = localWritable('cloudServerURL', 'http://herzberg.mit.edu');
export const cloudServerPORT = localWritable('cloudServerPORT', 18704);
// export const pyServerURL = derived(pyServerPORT, $pyServerPORT => `http://localhost:${$pyServerPORT}`);
export const pyServerURL = derived(
    [pyServerPORT, use_server, cloudServerPORT, cloudServerURL],
    ([$pyServerPORT, $use_server, $cloudServerPORT, $cloudServerURL]) => {
        return $use_server ? `${$cloudServerURL}:${$cloudServerPORT}` : `http://localhost:${$pyServerPORT}`;
    },
);
export const mainpyfile = derived([developerMode, pythonscript], async ([$developerMode, $pythonscript]) => {
    return $developerMode ? await path.join($pythonscript, 'main.py') : '';
});

// export const currentTab = localWritable('Configuration', 'settingsActiveTab');
export const serverDebug = localWritable('serverDebug', false);
export const serverCurrentStatus = writable<OutputBoxtype>({ value: 'umdapy server not running', type: 'error' });

export const pyChildProcess = writable<Child>();
export const suppressed_warnings = writable<Record<string, { timestamp: string; warnings: string[]; id: string }[]>>(
    {},
);

export const redis_server_mode = localWritable('redis_server_mode', false);
export const server_timeout_in_minutes = localWritable('server_timeout_in_minutes', 10);
