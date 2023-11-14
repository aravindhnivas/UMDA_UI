import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';

export const createPersistanceStore = <T>(value: T, key: string) => {
    if (!key) throw new Error('Please provide a valid key value');
    return persist(writable<T>(value), createLocalStorage(), key);
};
