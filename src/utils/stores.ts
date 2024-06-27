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

    return {
        subscribe,
        set,
        update,
        error(err: unknown) {
            const content = err instanceof Error ? err.stack || err.message : <string>err;
            update(_n => ({ content, type: 'error', open: true }));
        },
        info(content: string) {
            update(_n => {
                return { content, type: 'info', open: true };
            });
        },
        warn(content: string) {
            update(_n => {
                return { content, type: 'warn', open: true };
            });
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
