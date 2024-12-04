import { path } from '@tauri-apps/api';
import { invoke } from '@tauri-apps/api/core';
import { getVersion, getTauriVersion } from '@tauri-apps/api/app';
import { platform, arch } from '@tauri-apps/plugin-os';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { listen } from '@tauri-apps/api/event';
import type { DialogFilter } from '@tauri-apps/plugin-dialog';
import type { Child } from '@tauri-apps/plugin-shell';
import * as fs from '@tauri-apps/plugin-fs';
import * as dialog from '@tauri-apps/plugin-dialog';
import * as shell from '@tauri-apps/plugin-shell';
import * as os from '@tauri-apps/plugin-os';

export { fs, path, dialog, shell, os, invoke, platform, arch, getVersion, getTauriVersion };
// export { checkUpdate, installUpdate, relaunch, listen };
export { check as checkUpdate, relaunch, listen };
export type { DialogFilter, Child };

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
    if (!(await fs.exists(csv_file))) return { columns: [], data: [] };
    const contents = await fs.readTextFile(csv_file);
    if (!contents) return { columns: [], data: [] };
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
        toast.error(error);
        return undefined;
    }
};

export const safeJsonStringify = (obj: any) => {
    try {
        const jsonString: string = JSON.stringify(obj);
        return jsonString;
    } catch (error) {
        toast.error(error);
        return undefined;
    }
};

export const readJSON = async <T>(file: string) => {
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
interface RoundingResult {
    value: string;
    uncertainty: string;
    roundedValue: number;
    roundedUncertainty: number;
    decimalPlaces: number;
}

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export function roundToUncertainty(value: number, uncertainty: number): RoundingResult {
    // Input validation
    if (!Number.isFinite(value) || !Number.isFinite(uncertainty)) {
        throw new ValidationError('Both value and uncertainty must be finite numbers');
    }
    if (uncertainty <= 0) {
        throw new ValidationError('Uncertainty must be positive');
    }

    // Find significant digits and rounding position
    const position = getSignificantDigitPosition(uncertainty);
    const decimalPlaces = position < 0 ? -position : 0;
    const roundingFactor = Math.pow(10, decimalPlaces);

    // Round values
    const roundedValue = Math.round(value * roundingFactor) / roundingFactor;
    const roundedUncertainty = Math.round(uncertainty * roundingFactor);

    // Format output strings
    const valueStr = decimalPlaces > 0 ? roundedValue.toFixed(decimalPlaces) : roundedValue.toString();
    const uncertaintyStr = roundedUncertainty.toString();

    return {
        value: valueStr,
        uncertainty: uncertaintyStr,
        roundedValue,
        roundedUncertainty,
        decimalPlaces,
    };
}

function getSignificantDigitPosition(uncertainty: number): number {
    if (uncertainty >= 1) {
        return Math.floor(Math.log10(uncertainty));
    }

    const uncertaintyStr = uncertainty.toString();
    const match = uncertaintyStr.match(/[1-9]/);
    if (!match || match.index === undefined) {
        throw new ValidationError('Invalid uncertainty value');
    }

    const decimalIndex = uncertaintyStr.indexOf('.');
    return decimalIndex === -1 ? 0 : -(match.index - decimalIndex);
}

export function formatWithUncertainty(result: RoundingResult): string {
    return `${result.value} (${result.uncertainty})`;
}

export const read_csv = async (file: string) => {
    if (!(await fs.exists(file))) return { columns: [], data: [] };
    const contents = await fs.readTextFile(file);
    if (!contents) return { columns: [], data: [] };
    const lines = contents.split('\n');
    const columns = lines[0].split(',').filter(f => f.length > 0);
    const data = lines
        .slice(1)
        .map(line => line.split(','))
        .filter(f => f.length === columns.length);
    return { columns, data };
};
