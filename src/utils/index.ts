import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';
// import { Alert } from './stores';
// import { tempdir, platform } from '@tauri-apps/api/os';

export const createPersistanceStore = <T>(value: T, key: string) => {
    if (!key) throw new Error('Please provide a valid key value');
    return persist(writable<T>(value), createLocalStorage(), key);
};

// export const tempdirPath = await path.join(await tempdir(), import.meta.env.VITE_APP_ID);
// export const currentPlatform = await platform();

// if (!(await fs.exists(tempdirPath))) {
//     await fs.createDir(tempdirPath);
// }
export const toggle_loading = (node: HTMLButtonElement) => {
    if (!node) return;
    node.classList.contains('is-loading') ? node.classList.remove('is-loading') : node.classList.add('is-loading');
};
console.log('Utilities loaded');
