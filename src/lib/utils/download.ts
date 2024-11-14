import { unZIP } from '$pages/settings/utils/download-assets';
import { python_asset_ready_to_install } from '$pages/settings/utils/stores';
import { writable } from 'svelte/store';

export const assets_download_progress = writable<number>(0);
export const assets_download_pid = writable(0);

export const download_url = async (url: string, output_dir: string | null = null) => {
    if (!window.navigator.onLine) throw new Error('No internet connection');
    if (!url) throw new Error('url is not set');

    if (!output_dir) {
        console.warn('output_dir is not set');
        output_dir = await path.join(await path.homeDir(), 'Downloads');
    }

    // const output_dir = await path.join(await path.homeDir(), 'Downloads');
    console.warn('output_dir', output_dir);

    const cmd = shell.Command.create('curl', ['-LO', url, '--output-dir', output_dir, '--progress-bar']);
    const child = await cmd.spawn();
    assets_download_pid.set(child.pid);

    console.warn('child', child);

    cmd.stdout.on('data', data => {
        console.log(`stdout: ${data}`);
    });

    cmd.stderr.on('data', data => {
        console.warn(data);

        const progress = data.match(/(\d+.\d+)%/);
        // console.log('progress: ', progress);
        if (progress?.[0]) {
            // assets_download_progress.set(Number(progress[0]));
            const percent = parseFloat(progress[1]);
            assets_download_progress.set(percent / 100);
            // console.log('assets_download_progress: ', get(assets_download_progress));
        }
    });

    cmd.on('close', async code => {
        if (get(assets_download_progress) === 1) {
            console.log('Download completed');
            python_asset_ready_to_install.set(true);
            await unZIP();
        }
        assets_download_progress.set(0);
        assets_download_pid.set(0);
        console.log(`child process exited with code:`, code);
    });

    cmd.on('error', error => {
        console.error(`error: ${error}`);
    });
};
