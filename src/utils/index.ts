import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';
// import { Alert } from './stores';
import { tempdir } from '@tauri-apps/api/os';

export const createPersistanceStore = <T>(value: T, key: string) => {
    if (!key) throw new Error('Please provide a valid key value');
    return persist(writable<T>(value), createLocalStorage(), key);
};

export const toggle_loading = (node: HTMLButtonElement) => {
    if (!node) return;
    console.log(node);

    node.classList.contains('is-loading') ? node.classList.remove('is-loading') : node.classList.add('is-loading');
};

export const get_tmpdir = async () => {
    const tempdirPath = await path.join(await tempdir(), import.meta.env.VITE_APP_ID);
    if (!(await fs.exists(tempdirPath))) {
        await fs.createDir(tempdirPath);
    }
    return tempdirPath;
};

console.log('Utilities loaded');
