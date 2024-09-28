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

export const PlotlyColors = {
    muted_blue: '#1f77b4',
    safety_orange: '#ff7f0e',
    cooked_asparagus_green: '#2ca02c',
    brick_red: '#d62728',
    muted_purple: '#9467bd',
    chestnut_brown: '#8c564b',
    raspberry_yogurt_pink: '#e377c2',
    middle_gray: '#7f7f7f',
    curry_yellow_green: '#bcbd22',
    blue_teal: '#17becf',
};

export function typeSafeObjectKeys<T extends object>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}

export const safeJsonParse = <T>(str: string) => {
    try {
        const jsonValue: T = JSON.parse(str);
        return jsonValue;
    } catch (error) {
        console.error(error);
        if (error instanceof Error) toast.error(error?.message);
        return undefined;
    }
};

export const safeJsonStringify = (obj: any) => {
    try {
        const jsonString: string = JSON.stringify(obj);
        return jsonString;
    } catch (error) {
        console.error(error);
        if (error instanceof Error) toast.error(error?.message);
        return undefined;
    }
};

export const readJSON = async <T>(file: string) => {
    if (!file) {
        console.error('File not specified');
        return undefined;
    }
    if (!(await fs.exists(file))) {
        console.error(`File not found: ${file}`);
        return undefined;
    }
    const contents = await fs.readTextFile(file);
    return safeJsonParse<T>(contents);
};

export const writeJSON = async (file: string, data: any, append: boolean = false) => {
    if (!file) return;
    if (!data) return;
    if (typeof data === 'function') return;

    if (isObject(data) && Object.keys(data).length === 0) {
        toast.error('Empty data object');
        return;
    }

    if (isArray(data) && data.length === 0) {
        toast.error('Empty data array');
        return;
    }

    if (typeof data === 'string' && data.trim() === '') {
        toast.error('Empty data string');
        return;
    }

    if (typeof data === 'number' && isNaN(data)) {
        toast.error('NaN data');
        return;
    }

    if (typeof data === 'object' && data === null) {
        toast.error('Null data');
        return;
    }

    if (append) {
        const existingData = await readJSON(file);
        if (existingData) {
            data = { ...existingData, ...data };
        }
    }

    const jsonString = safeJsonStringify(data);
    if (jsonString) {
        await fs.writeTextFile(file, jsonString);
    }
};
