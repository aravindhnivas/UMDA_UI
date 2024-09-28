export const logger_store = (message: string, length: number = 500) => {
    const { subscribe, set, update } = writable<LoggerStore[]>([]);

    function clear() {
        const date = new Date().toLocaleTimeString();
        set([{ type: 'info', message: `${date} Terminal cleared by user!!` }]);
    }

    function add(type: 'info' | 'warning' | 'error' | 'success', message: string, prefix?: '>' | '>>' | '$') {
        update(logger => {
            if (logger.length > length) {
                logger = logger.slice(0, length);
            }

            const time = new Date().toLocaleTimeString();
            message = `${time} ${message}`;
            if (!prefix) prefix = '>';
            const log = { type, message, prefix };
            logger = [log, ...logger];
            return logger;
        });
    }

    // initialize the logger with the message
    // const date = new Date().toLocaleTimeString();
    // set([{ type: 'info', message: `${date} ${message}` }]);

    return {
        subscribe,
        set,
        clear,
        info: (message: string) => add('info', message),
        warn: (message: string) => add('warning', message),
        error: (message: string) => add('error', message),
        success: (message: string) => add('success', message),
        prompt: (message: string) => add('info', message, '$'),
        cmd: (message: string) => add('info', message, '>'),
        subcmd: (message: string) => add('info', message, '>>'),
    };
};

export const serverInfo = logger_store('Server console initialized', 500);
export const terminal_log = logger_store('Terminal console initialized', 1000);
export const outputbox = logger_store('Update console initialized', 500);

export const asset_download_required = writable(false);
export const assets_version_available = writable('');
export const downloadoverrideURL = writable(import.meta.env.DEV);
export const installing_python_assets = writable(false);
export const install_update_without_promt = writable(false);
export const python_asset_ready_to_install = localWritable('python_asset_ready_to_install', false);
export const assets_installation_required = localWritable('assets_installation_required', false);
export const python_asset_ready = writable(false);
export const downloadURL = localWritable<string>('downloadURL', '');

interface RunningProcess {
    pyfile: string;
    close?: {
        name: string;
        cb: () => Promise<void>;
        style: string;
    };
    progress?: number;
    completed?: boolean;
    aborted?: boolean;
    logs?: string;
    start_time?: string;
    end_time?: string;
}

export const create_running_processes_store = () => {
    const {
        set,
        subscribe,
        update: storeUpdate,
    } = writable<{
        [key: string]: RunningProcess;
    }>({});

    const update = (fn: (p: { [key: string]: RunningProcess }) => { [key: string]: RunningProcess }) => {
        storeUpdate(p => {
            if (!p) p = {};
            const updated = fn(p);
            return updated;
        });
    };

    const add = (pid: number, obj: RunningProcess) => {
        update(p => {
            p[pid] = { ...obj, start_time: new Date().toLocaleString() };

            if (Object.keys(p).length > 25) {
                // delete the first 5 keys
                const keys = Object.keys(p).slice(0, 5);
                for (const key of keys) {
                    delete p[key];
                }
            }
            return p;
        });
    };

    const remove = (pid: number) => {
        update(p => {
            delete p[pid];
            return p;
        });
    };

    const mark_aborted = (pid: number) => {
        update(p => {
            p[pid].aborted = true;
            p[pid].end_time = new Date().toLocaleString();
            return p;
        });
    };

    const mark_completed = (pid: number) => {
        update(p => {
            p[pid].completed = true;
            p[pid].end_time = new Date().toLocaleString();
            return p;
        });
    };

    const update_progress = (pid: number, progress: number) => {
        update(p => {
            p[pid].progress = progress;
            return p;
        });
    };

    const add_logs = (pid: number, log: string) => {
        update(p => {
            p[pid].logs = log;
            return p;
        });
    };

    return {
        set,
        subscribe,
        update,
        add,
        remove,
        mark_completed,
        update_progress,
        mark_aborted,
        add_logs,
    };
};

export const running_processes = create_running_processes_store();

export const running_processes_pids = derived(running_processes, $running_processes => {
    return Object.keys($running_processes).map(Number);
});

export const running_processes_count = derived(running_processes, $running_processes => {
    const total = Object.keys($running_processes).length;
    const completed = Object.values($running_processes).filter(p => p.completed && !p.aborted).length;
    const aborted = Object.values($running_processes).filter(p => p.aborted).length;
    const running = total - completed - aborted;
    return { total, completed, aborted, running };
});
