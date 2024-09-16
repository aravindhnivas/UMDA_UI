<script lang="ts">
    import {
        downloadURL,
        downloadoverrideURL,
        python_asset_ready_to_install,
        install_update_without_promt,
    } from '$pages/settings/utils/stores';
    import { updateError } from '$utils/stores';
    import { activateChangelog } from '$utils/stores';
    import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
    import { relaunch } from '@tauri-apps/api/process';
    import { stopServer } from '$lib/pyserver/umdapyServer';
    import { listen } from '@tauri-apps/api/event';
    import { outputbox } from '$settings/utils/stores';
    import Textfield from '@smui/textfield';
    import { footerMsg } from '$lib/utils/initialise';
    import {
        download_assets,
        check_assets_update,
        unZIP,
        asset_name_prefix,
    } from '$pages/settings/utils/download-assets';
    import { updateInterval } from '$utils/stores';
    import Layout from './comp/Layout.svelte';
    import { getVersion } from '@tauri-apps/api/app';
    import { git_url } from '$lib/utils';
    import TerminalBox from '$lib/components/TerminalBox.svelte';
    import { Checkbox } from '$lib/components';
    import { toggle_loading } from '$utils/index';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { umdapyVersion } from '$lib/pyserver/stores';
    import { ExternalLink } from 'lucide-svelte/icons';

    let install_dialog_active = false;
    export const check_for_update = async (log = false) => {
        if (!window.navigator.onLine) return;
        if (install_dialog_active) return;

        $install_update_without_promt = false;
        await check_assets_update();

        outputbox.warn('checking for app update');
        if (assets_download_progress > 0 && assets_download_progress < 1) {
            return outputbox.warn('waiting for assets to complete downloading');
        }

        const response = await axios(git_url.gui.latest());
        const latest_version = response.data.tag_name;
        outputbox.warn(`latest_version: ${latest_version}`);
        outputbox.warn(`current_version: v${currentVersion}`);
        lastUpdateCheck = new Date().toLocaleString();
        if (`v${currentVersion}` === latest_version) {
            version_info = 'latest version installed';
            outputbox.success(version_info);
            return;
        }

        try {
            if (log) outputbox.info('Checking for updates...');
            download_progress = 0;
            const update = await checkUpdate();
            if (log) outputbox.info(JSON.stringify(update));

            if (import.meta.env.DEV) {
                toast.error('Update installation is skipped in dev mode');
                return;
            }

            if (import.meta.env.PROD && update.shouldUpdate) {
                const newVersion = update.manifest?.version;
                let install_promted = $install_update_without_promt;

                if (!install_promted) {
                    install_dialog_active = true;
                    install_promted = await dialog.confirm(`Do you want to install the latest update and restart.`, {
                        title: `Update available ${newVersion}`,
                    });
                    install_dialog_active = false;
                }

                if (install_promted) {
                    await stopServer();
                    if (!update.manifest?.body) return outputbox.error('Update manifest is empty');
                    outputbox.success(
                        `Installing update ${newVersion}, ${update.manifest.date}, ${update.manifest.body}`,
                    );

                    await installUpdate();
                    await relaunch();
                }
            }
        } catch (error) {
            $updateError = error instanceof Error ? error.message : String(error);
        }
    };

    let download_progress = 0;
    let assets_download_progress = 0;
    let version_info = '';

    const update_footer_download_label = (percent: number) => {
        if (Number(percent) < 100) {
            $footerMsg.status = 'running';
        } else if (Number(percent) === 0) {
            $footerMsg.status = 'idle';
        } else {
            $footerMsg.status = 'done';
        }
    };

    const listen_download_progress = listen('tauri://update-download-progress', async function (res) {
        if (res.payload) {
            const { chunkLength, contentLength } = res.payload as { chunkLength: string; contentLength: string };

            download_progress += +chunkLength / +contentLength;
            const percent = Number(download_progress * 100).toFixed(2);
            $footerMsg.msg = `Downloading Update (${percent} %)`;

            update_footer_download_label(Number(percent));
        }
    });

    let updateReadyToInstall = false;
    let lastUpdateCheck: string = 'Not checked yet';

    const unlisten_download_asset_event = listen<string>('assets-download-progress', event => {
        const percent = event.payload;
        assets_download_progress = Number(percent) / 100;
        $footerMsg.msg = `Downloading python assets (${percent} %)`;
        update_footer_download_label(Number(percent));
    });

    let currentVersion = '';

    const get_umdapy_version = async (umdapy_folder: string) => {
        if (!(await fs.exists(umdapy_folder))) return;
        const umdapy_version_file = await path.join(umdapy_folder, '_internal', 'umdalib', '__version__.dat');
        if (!(await fs.exists(umdapy_version_file))) return;
        const umdapy_version_file_content = await fs.readTextFile(umdapy_version_file);
        if (!umdapy_version_file_content) return;
        $umdapyVersion = umdapy_version_file_content;
    };

    let unlisten_check_for_update: ReturnType<typeof setInterval>;
    const set_update_interval = (time_in_min: number) => {
        if (!import.meta.env.PROD) return console.warn('update interval is not set in dev mode');
        if (unlisten_check_for_update) clearInterval(unlisten_check_for_update);
        unlisten_check_for_update = setInterval(
            async () => {
                await check_for_update(true);
            },
            time_in_min * 60 * 1000,
        );
    };
    onMount(async () => {
        console.log('Update page mounted');

        currentVersion = await getVersion();
        const umdapy_folder = await path.join(await path.appLocalDataDir(), asset_name_prefix);
        const download_assets_btn = document.getElementById('btn-download-asset');

        if (!(await fs.exists(umdapy_folder))) {
            download_assets_btn?.click();
        } else {
            console.warn(`${asset_name_prefix} folder exists`);
            await get_umdapy_version(umdapy_folder);
        }

        if (import.meta.env.PROD) {
            set_update_interval(Number($updateInterval));
            await check_for_update(true);
        }
    });

    onDestroy(async () => {
        if (unlisten_check_for_update) clearInterval(unlisten_check_for_update);
        const unlisten1 = await unlisten_download_asset_event;
        unlisten1();
        const unlisten2 = await listen_download_progress;
        unlisten2();
    });
</script>

<Layout id="Update" class="pl-5">
    <h1>Update</h1>
    {#if !window.navigator.onLine}
        <div class="ml-auto" aria-label="No internet connection" data-cooltipz-dir="left">
            <div class="i-ion-cloud-offline-outline" />
        </div>
    {/if}

    <div class="align">
        <div class="text-sm" style="width: 100%;">
            Current version: <span class="badge text-sm">v{currentVersion}</span>
            {#if version_info}
                <span class="badge badge-success">{version_info}</span>
            {/if}
        </div>

        <div class="align">
            <div class="align">
                <button
                    class="btn btn-sm"
                    class:is-warning={updateReadyToInstall}
                    id="updateCheckBtn"
                    on:click={async () => {
                        if (!window.navigator.onLine) return outputbox.warn('No internet connection');
                        await check_for_update(true);
                    }}
                >
                    {updateReadyToInstall ? 'Quit and Install' : 'Check update'}
                </button>

                <button
                    class="btn btn-sm"
                    on:click={() => {
                        $activateChangelog = true;
                    }}
                    >What's New <ExternalLink class="ml-2" />
                </button>

                <div class="ml-auto">
                    <CustomInput
                        bind:value={$updateInterval}
                        label="update interval (in min)"
                        type="number"
                        on:change={() => {
                            $updateInterval = Number($updateInterval);
                            set_update_interval($updateInterval);
                        }}
                    />
                </div>
            </div>

            <div class="updateCheck_status_div">
                <span>Last checked</span>
                <span class="badge badge-info" id="update-check-status">{lastUpdateCheck}</span>
            </div>
        </div>

        {#if download_progress}
            <div class="progress__div">
                <span class="badge badge-info">updating...</span>
                <progress class="progress w-full" value={download_progress} max="1"></progress>
            </div>
        {/if}

        <h3>Python assets download</h3>

        {#if import.meta.env.DEV}
            <div class="flex w-full gap-2">
                <Textfield bind:value={$downloadURL} label="download-URL" style="width: 100%" />
                <Checkbox bind:value={$downloadoverrideURL} label="override URL" />
            </div>
        {/if}

        <div class="align">
            <button
                id="btn-check-asset-update"
                class="btn btn-sm ld-ext-right"
                on:click={async ({ currentTarget }) => {
                    if (!window.navigator.onLine) return outputbox.warn('No internet connection');
                    toggle_loading(currentTarget);
                    const [_err] = await oO(check_assets_update({ download_request: true }));
                    toggle_loading(currentTarget);
                }}
            >
                Check assets update
                <div class="ld ld-ring ld-spin"></div>
            </button>
            <button
                id="btn-download-asset"
                class="btn btn-sm ld-ext-right"
                on:click={async ({ currentTarget }) => {
                    console.warn('download assets');
                    if (!window.navigator.onLine) return outputbox.warn('No internet connection');
                    assets_download_progress = 0;
                    toggle_loading(currentTarget);
                    const [_err] = await oO(download_assets());
                    toggle_loading(currentTarget);
                }}
                >Download assets {$python_asset_ready_to_install ? 'again' : ''}
                <div class="ld ld-ring ld-spin"></div></button
            >

            {#if $python_asset_ready_to_install}
                <button
                    id="install-asset-btn"
                    class="btn btn-sm ld-ext-right"
                    on:click={async ({ currentTarget }) => {
                        toggle_loading(currentTarget);
                        const [_err] = await oO(unZIP(false));
                        toggle_loading(currentTarget);
                    }}
                    >Install assets
                    <div class="ld ld-ring ld-spin"></div></button
                >
            {/if}
        </div>

        {#if assets_download_progress > 0 && assets_download_progress < 1}
            <div class="progress__div">
                <span class="badge badge-info">update-progress</span>
                <progress class="progress w-full" value={assets_download_progress} max="1"></progress>
            </div>
        {/if}
    </div>
    <TerminalBox bind:terminal={$outputbox} />
</Layout>

<style lang="scss">
    .progress__div {
        display: grid;
        grid-template-columns: auto 1fr;
        width: 100%;
        align-items: center;
        gap: 0.5em;
    }
    .updateCheck_status_div {
        display: flex;
        gap: 0.2em;
        align-items: flex-end;
        flex-direction: column;
        margin-left: auto;
    }
</style>
