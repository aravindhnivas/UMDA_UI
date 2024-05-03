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
    import { download_assets, check_assets_update, unZIP } from '$pages/settings/utils/download-assets';
    import { updateInterval } from '$utils/stores';
    import Layout from './comp/Layout.svelte';
    import { getVersion } from '@tauri-apps/api/app';
    import { git_url } from '$lib/utils';
    import TerminalBox from '$lib/components/TerminalBox.svelte';
    import { Checkbox } from '$lib/components';
    import { toggle_loading } from '$utils/index';

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
            if (log) outputbox.info(update);

            if (import.meta.env.DEV) return window.createToast('Update installation is skipped in dev mode', 'danger');

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
                    outputbox.success(
                        `Installing update ${newVersion}, ${update.manifest?.date}, ${update.manifest.body}`,
                    );

                    await installUpdate();
                    await relaunch();
                }
            }
        } catch (error) {
            $updateError = error;
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
    onMount(async () => {
        currentVersion = await getVersion();
        if (import.meta.env.PROD) {
            await check_for_update();
        }
    });

    onDestroy(async () => {
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
                    }}>What's New <i class="i-mdi-open-in-new ml-2 text-xs" /></button
                >

                <div class="ml-auto">
                    <Textfield
                        input$type="number"
                        variant="outlined"
                        width="10px"
                        class="ml-auto"
                        bind:value={$updateInterval}
                        label="update interval (in min)"
                    />
                </div>
            </div>

            <div class="updateCheck_status_div">
                <span>Last checked</span>
                <span class="badge badge-info" id="update-check-status">{lastUpdateCheck}</span>
            </div>
            <!-- <Notify bind:label={$updateError} type="danger" /> -->
        </div>

        {#if download_progress}
            <div class="progress__div">
                <span class="badge badge-info">updating...</span>
                <!-- <LinearProgress progress={download_progress} /> -->
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
                <!-- <LinearProgress progress={assets_download_progress} /> -->
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
