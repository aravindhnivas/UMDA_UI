import { dialog } from '@tauri-apps/api';

const username: string = import.meta.env.VITE_username;
const pyrepo: string = import.meta.env.VITE_pyrepo;
const pybranch: string = import.meta.env.VITE_pybranch;
const repo: string = import.meta.env.VITE_repo;
const branch: string = import.meta.env.VITE_branch;

export const git_url = {
    gui: {
        latest: () => `https://api.github.com/repos/${username}/${repo}/releases/latest`,
        usercontent: () => `https://raw.githubusercontent.com/${username}/${repo}/${branch}`,
    },
    py: {
        latest: () => `https://api.github.com/repos/${username}/${pyrepo}/releases/latest`,
        usercontent: () => `https://raw.githubusercontent.com/${username}/${pyrepo}/${pybranch}`,
    },
};

export const browse_folder = async (
    {
        directory,
        multiple,
        filters,
    }: {
        directory?: boolean;
        multiple?: boolean;
        filters?: string[];
    } = { directory: true, multiple: false, filters: undefined },
) => {
    const opts: dialog.OpenDialogOptions = {
        directory,
        multiple,
    };

    if (filters) {
        opts.filters = filters?.map(ext => ({ name: ext, extensions: [ext] }));
    }
    const result = await dialog.open(opts);
    if (!result) return '';
    return result;
};
