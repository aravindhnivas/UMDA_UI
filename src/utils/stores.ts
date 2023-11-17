import { createPersistanceStore } from '$utils/index';
import { writable } from 'svelte/store';

function openModalStore() {
    const defaultValues: {
        type: 'error' | 'warning';
        content: string | Error;
        open: boolean;
    } = {
        type: 'warning',
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
            update(n => {
                return { content, type: 'warning', open: true };
            });
        },
        reset: () => set(defaultValues),
    };
}
export const Alert = openModalStore();
export const active_tab = createPersistanceStore('Home', 'active_tab');
