import { umdapyVersion, pyServerReady } from '$lib/pyserver/stores';
import {
    outputbox,
    downloadURL,
    python_asset_ready,
    downloadoverrideURL,
    asset_download_required,
    installing_python_assets,
    assets_version_available,
    assets_installation_required,
    python_asset_ready_to_install,
    install_update_without_promt,
    serverInfo,
} from './stores';
import { platform } from '@tauri-apps/api/os';
import { invoke } from '@tauri-apps/api';
import { isEmpty, round } from 'lodash-es';
import { start_and_check_umdapy_with_toast, stopServer } from '$lib/pyserver/umdapyServer';
import { footerMsg } from '$lib/utils/initialise';
import { auto_download_and_install_assets } from './assets-status';
import { sleep } from '$lib/utils/initialise';
import { Alert } from '$utils/stores';

let assets_downloading = false;
let assets_installing = false;

export const asset_name_prefix = 'umdapy';

export const remove_asset_folder = async () => {
    const asset_folder = await path.join(await path.appLocalDataDir(), asset_name_prefix);
    if (!(await fs.exists(asset_folder))) return;
    outputbox.warn('Trying to remove existing umdapy folder');
    const [err] = await oO(fs.removeDir(asset_folder, { recursive: true }));
    if (err) return Promise.reject(`Could not delete the existing umdapy folder\n ${JSON.stringify(err)}`);

    return Promise.resolve(asset_folder + ' folder deleted');
};

export async function downloadZIP() {
    try {
        if (!window.navigator.onLine) {
            outputbox.warn('No internet connection');
            return;
        }
        if (assets_downloading) return outputbox.warn('already downloading assets...');

        const asset_name = `${asset_name_prefix}-${await platform()}.zip`;
        let browser_download_url = '';

        assets_downloading = true;

        if (!get(downloadoverrideURL)) {
            if (isEmpty(current_release_data)) {
                outputbox.error('To download assets, first check assets update to obtain release data...');
                return;
            }

            const { assets } = current_release_data as { assets: [{ name: string; browser_download_url: string }] };
            const asset_ind = assets.findIndex(e => e.name === asset_name);

            browser_download_url = assets[asset_ind].browser_download_url;
            outputbox.warn('downloading assets...');
        }
        const URL_to_download: string = get(downloadoverrideURL) ? get(downloadURL) : browser_download_url;

        outputbox.warn(URL_to_download);
        const startTime = performance.now();

        const localdir = await path.appLocalDataDir();
        const fileName = await path.join(localdir, asset_name);
        const [download_err, download_output] = await oO(invoke('download_url', { url: URL_to_download, fileName }));

        if (download_err) {
            return outputbox.error(download_err as string);
        }

        outputbox.success(download_output as string);

        const duration = performance.now() - startTime;
        outputbox.warn(`Time taken to download: ${round(duration, 0)} ms`);
        outputbox.success(`assets downloaded`);

        python_asset_ready_to_install.set(true);
    } catch (err) {
        outputbox.error(`error occured while downloading assets`);
        outputbox.error(err as string);
    } finally {
        assets_downloading = false;
    }
}

export function unZIP(installation_request = true) {
    let warning = '';
    if (assets_installing) warning = 'already installing assets...';
    if (!get(python_asset_ready_to_install)) warning = 'no assets to install';

    if (warning) {
        console.warn(warning);
        outputbox.warn(warning);
        return Promise.reject(warning);
    }

    assets_installing = true;
    outputbox.warn('unzipping assets...');

    return new Promise(async (resolve, reject) => {
        const localdir = await path.appLocalDataDir();
        const asset_name = `${asset_name_prefix}-${await platform()}.zip`;
        const asset_zipfile = await path.join(localdir, asset_name);

        footerMsg.set({ msg: 'installing assets...', status: 'running' });

        if (installation_request) {
            if (!(await dialog.confirm('Install it now ?', { title: 'Python assets update ready.' }))) {
                footerMsg.set({ msg: '', status: 'idle' });
                assets_installation_required.set(true);
                assets_installing = false;
                return reject('installation skipped');
            }
        }
        install_update_without_promt.set(true);

        if (get(pyServerReady)) {
            await stopServer({ update_info: false });
        }

        await remove_asset_folder();

        const args = {
            // win32: ['Expand-Archive', '-Path', asset_zipfile, '-DestinationPath', `${localdir}`, '-Force'],
            win32: ['-xf', asset_zipfile, '-C', localdir],
            darwin: [asset_zipfile, '-d', localdir],
            linux: [asset_zipfile, '-d', localdir],
        };
        const currentplatform = (await platform()) as 'darwin' | 'win32' | 'linux';
        const command = currentplatform === 'win32' ? `unzip-${await platform()}` : 'unzip-darwin';
        const cmd = new shell.Command(command, args[currentplatform]);

        let err: string;
        const child = await cmd.spawn();

        installing_python_assets.set(true);
        outputbox.info(`unzip PID: ${child.pid}`);

        cmd.on('close', async () => {
            assets_installing = false;
            if (err) {
                footerMsg.set({ msg: 'failed to install assets', status: 'done' });
                outputbox.error('failed to UNZIP');
                reject('failed to UNZIP');
            } else {
                footerMsg.set({ msg: 'assets installation completed', status: 'done' });
                outputbox.success('UNZIP success');
                assets_installation_required.set(false);
                resolve('UNZIP success');
                await sleep(1000);
                await fs.removeFile(asset_name, { dir: fs.BaseDirectory.AppLocalData });
            }
            installing_python_assets.set(false);

            outputbox.warn('UNZIP process closed');
            python_asset_ready_to_install.set(false);
            await sleep(1000);
            await start_and_check_umdapy_with_toast();
            setTimeout(() => footerMsg.set({ msg: '', status: 'idle' }), 1 * 60 * 1000);
        });

        cmd.on('error', error => {
            err = error;
            outputbox.error('Error whiile UNZIPing assets');
            outputbox.error(error);
        });

        cmd.stderr.on('data', stderr => {
            err = stderr;
            outputbox.error(stderr);
        });

        cmd.stdout.on('data', stdout => {
            outputbox.info(stdout);
        });
    });
}

let current_release_data = {};

const get_assets_url = async () => {
    const URL = import.meta.env.VITE_UMDAPY_URL;

    const [_err1, response] = await oO(axios<{ tag_name: string }>(URL));
    if (_err1) return outputbox.error(_err1);
    if (!response) return;

    if (response.status !== 200) return outputbox.error('Could not download the assets');

    current_release_data = response.data;
    assets_version_available.set(response.data.tag_name);

    if (!get(assets_version_available)) return outputbox.error('Could not determine assets version');
    return true;
};

const fn_asset_download_required = async ({
    installation_request,
    download_request,
}: {
    installation_request: boolean;
    download_request: boolean;
}) => {
    outputbox.warn(`Download required`);
    asset_download_required.set(true);
    await auto_download_and_install_assets({ installation_request, download_request });
    return;
};

export const check_assets_update = async ({ installation_request = true, download_request = false } = {}) => {
    if (!window.navigator.onLine) return;
    if (get(python_asset_ready_to_install)) {
        return outputbox.warn('assets updates are ready to install');
    }

    if (!(await get_assets_url())) return;

    outputbox.info(`Available version: ${get(assets_version_available)}`);

    if (!get(umdapyVersion)) {
        outputbox.error('Current version not determined yet.');
        return;
    }
    outputbox.info(`Current version: v${get(umdapyVersion)}`);

    if (`v${get(umdapyVersion)}` < get(assets_version_available)) {
        await fn_asset_download_required({ installation_request, download_request });
        return;
    }

    if (get(umdapyVersion) < import.meta.env.VITE_PY_MIN_VERSION) {
        await fn_asset_download_required({ installation_request, download_request });
        return;
    }

    outputbox.warn(`Download not required`);
    asset_download_required.set(false);
};

export const download_assets = async () => {
    if (!window.navigator.onLine) {
        outputbox.warn('No internet connection');
        return;
    }

    if (get(downloadoverrideURL)) {
        await downloadZIP();
        return;
    }
    if (!get(python_asset_ready)) {
        if (!(await get_assets_url())) return;
        await downloadZIP();
        return;
    }

    if (!get(python_asset_ready) && !get(asset_download_required)) {
        if (!(await dialog.confirm('continue downloading', { title: 'Download NOT required' }))) return;
    }

    await downloadZIP();
};

export const install_umdapy_from_zipfile = async () => {
    try {
        const result = (await dialog.open({
            directory: false,
            filters: [
                { name: 'zip files', extensions: ['zip'] },
                { name: 'All files', extensions: ['*.*'] },
            ],
            multiple: false,
        })) as string;

        if (!result) return;

        serverInfo.warn(result);

        const asset_name = `${asset_name_prefix}-${await platform()}.zip`;
        const localdir = await path.appLocalDataDir();
        const asset_zipfile = await path.join(localdir, asset_name);

        const [_err] = await oO(fs.copyFile(result, asset_zipfile));
        if (_err) {
            serverInfo.error(_err);
        } else {
            serverInfo.warn('file copied');
        }
        python_asset_ready_to_install.set(true);
        await oO(unZIP(false));
    } catch (error) {
        if (error instanceof Error) Alert.error(error);
    }
};
