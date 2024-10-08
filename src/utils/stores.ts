function openModalStore() {
    const defaultValues: {
        type: 'error' | 'info' | 'warn';
        content: string | Error;
        open: boolean;
    } = {
        type: 'info',
        content: 'Content',
        open: false,
    };

    const { subscribe, set, update } = writable(defaultValues);

    const add_log = (log: unknown, type: 'error' | 'info' | 'warn') => {
        let content: string;
        if (log instanceof Error) content = log.message + '\n' + log.stack;
        else if (typeof log === 'object') content = JSON.stringify(log);
        else if (typeof log === 'string') content = log;
        else content = 'An error occurred';
        update(_n => ({ content, type, open: true }));
    };

    return {
        subscribe,
        set,
        update,
        error(err: unknown) {
            add_log(err, 'error');
        },
        info(content: string | Record<string, unknown>) {
            add_log(content, 'info');
        },
        warn(content: string | Record<string, unknown>) {
            add_log(content, 'warn');
        },
        reset: () => set(defaultValues),
    };
}
export const Alert = openModalStore();
export const active_tab = localWritable('active_tab', 'Home');

export const updateInterval = localWritable('updateInterval', 15);
export const updateError = writable('');
export const updateStatus = writable('');
export const activateChangelog = writable(false);
