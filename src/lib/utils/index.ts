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

export function validateInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const key = event.key as string;

    // Allow digits, one decimal point, control keys, and navigation keys
    // Check if the key is a digit or a control/navigation key
    const isDigitOrControlKey =
        /[0-9]/.test(key) || ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(key);

    // Allow only one decimal point
    const isDecimalPoint = key === '.' && !input.value.includes('.');

    if (!isDigitOrControlKey && !isDecimalPoint) {
        event.preventDefault();
    }
}

export const parse_csv_file = async (csv_file: string) => {
    const contents = await fs.readTextFile(csv_file);
    const lines = contents.split('\n');
    const columns = lines[0].split(',');
    const data = lines.slice(1).map(line => line.split(','));
    return { columns, data };
};
