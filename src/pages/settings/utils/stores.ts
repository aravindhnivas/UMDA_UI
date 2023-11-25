import { LOGGER } from '$lib/utils/logger';
import { createPersistanceStore } from '$utils/index';
import { type ITerminalInitOnlyOptions, type ITerminalOptions } from 'xterm';

export const create_logger_store = (value: OutputBoxtype[]) => {
    const { set, subscribe, update } = writable(value);
    const setVal = (log: string | Object) => {
        return typeof log === 'string' ? log.trim() : JSON.stringify(log, null, 2);
    };
    const add = (val: OutputBoxtype) => {
        if (!val.value) val.value = 'No output returned';
        update(output => {
            if (output.length > 100) output = output.slice(0, -50);
            return [val, ...output];
        });
    };

    return {
        set,
        subscribe,
        update,
        add,
        warn: (log: string | Object) => add({ value: setVal(log), type: 'warning' }),
        error: (log: string | Object) => add({ value: setVal(log), type: 'error' }),
        info: (log: string | Object) => add({ value: setVal(log), type: 'info' }),
        success: (log: string | Object) => add({ value: setVal(log), type: 'success' }),
        clear: () => set([]),
    };
};

function xterm_logger_store() {
    const { subscribe, set } = writable<LOGGER>();

    function init(node: HTMLElement, options?: ITerminalOptions & ITerminalInitOnlyOptions) {
        const logger = new LOGGER(node, options);
        set(logger);
    }

    function info(message: string) {
        subscribe((logger) => {
            logger?.info(message);
        })();
    }

    function warn(message: string) {
        subscribe(logger => {
            logger?.warn(message);
        })();
    }

    function error(message: string) {
        subscribe(logger => {
            logger?.error(message);
        })();
    }

    function success(message: string) {
        subscribe(logger => {
            logger?.success(message);
        })();
    }

    return {
        set,
        subscribe,
        init,
        info,
        warn,
        error,
        success,
    };
}

export const serverInfo = xterm_logger_store();
export const terminal_log = xterm_logger_store();
export const outputbox = xterm_logger_store();

export const asset_download_required = writable(false);
export const assets_version_available = writable('');
export const downloadoverrideURL = writable(import.meta.env.DEV);
export const installing_python_assets = writable(false);
export const install_update_without_promt = writable(false);
export const python_asset_ready_to_install = createPersistanceStore(false, 'python_asset_ready_to_install');
export const assets_installation_required = createPersistanceStore(false, 'assets_installation_required');
export const python_asset_ready = writable(false);
export const downloadURL = createPersistanceStore<string>(import.meta.env.downloadURL, 'downloadURL');

export const running_processes = writable<
    {
        pid: number | undefined;
        pyfile: string;
        close?: {
            name: string;
            cb: () => Promise<void>;
            style: string;
        };
    }[]
>([]);
