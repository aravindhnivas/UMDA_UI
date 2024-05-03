<script lang="ts">
    import {
        developerMode,
        serverCurrentStatus,
        pythonpath,
        pythonscript,
        pyServerReady,
        pyVersion,
        umdapyVersion,
    } from '$lib/pyserver/stores';
    import { BrowseBtn, Checkbox } from '$components/index';
    import Layout from './comp/Layout.svelte';
    import { fetchServerROOT } from '$lib/pyserver/umdapyServer';
    import { getPyVersion } from './utils/checkPython';
    import { install_umdapy_from_zipfile } from './utils/download-assets';
    import { check_umdapy_assets_status } from './utils/assets-status';
    import PyServerControl from './config/PyServerControl.svelte';
    import WebsocketServerControl from './config/WebsocketServerControl.svelte';
    import Accordion from '@smui-extra/accordion';
    import TerminalBox from '$lib/components/TerminalBox.svelte';
    import { serverInfo } from './utils/stores';

    const get_local_dir = async () => {
        try {
            const localdir = await path.appLocalDataDir();
            console.log(localdir);
            await shell.open(localdir);
        } catch (error) {
            toast.error(error as string);
        }
    };

    const get_log_dir = async () => {
        try {
            const dir = await path.appLogDir();
            console.log(dir);
            await shell.open(dir);
        } catch (error) {
            toast.error(error as string);
        }
    };

    onMount(async () => {
        if (import.meta.env.DEV) {
            if (!$pyServerReady) {
                const [err] = await oO(fetchServerROOT());
                if (err) {
                    console.error(err);
                }
            }
        }
    });

    let panel1Open = true;
</script>

<Layout id="Configuration">
    <div class="flex gap-1 items-center">
        {#if $pyServerReady && $pyVersion}
            <div class="badge badge-success">Python: {$pyVersion} (umdapy: {$umdapyVersion})</div>
        {:else}
            <div class="badge badge-error">Invalid python</div>
        {/if}
        <div class="badge badge-{$serverCurrentStatus.type}">{$serverCurrentStatus.value}</div>
        <Checkbox class="ml-auto" bind:value={$developerMode} label="Developer mode" />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <i
            on:click={() => {
                // console.log($serverInfo.info('settings opened'));
                const modal = document.getElementById('umdaui_modal');
                modal?.showModal();
            }}
            class="i-material-symbols-settings-alert-outline"
        ></i>
    </div>

    <div class="flex items-center gap-1">
        <button class="btn btn-sm" on:click={async () => await getPyVersion()}>get PyVersion</button>
    </div>

    {#if $developerMode}
        <BrowseBtn bind:value={$pythonpath} dir={false} label="Enter python location or python keyword" />
        <BrowseBtn bind:value={$pythonscript} dir={true} label="Python source file" />
    {/if}

    <div class="flex gap-1 mt-3">
        <button
            class="btn btn-sm"
            on:click={async () => {
                await check_umdapy_assets_status({ installation_request: true });
            }}>check-umdapy-assets</button
        >

        <button class="btn btn-sm" on:click={get_local_dir}>APP Local data <i class="i-mdi-open-in-new" /></button>
        <button class="btn btn-sm" on:click={get_log_dir}>logs folder<i class="i-mdi-open-in-new" /></button>

        <button
            class="btn btn-sm ml-auto"
            on:click={async () => {
                await oO(install_umdapy_from_zipfile());
            }}>Install from ZIPfile <i class="i-material-symbols-drive-folder-upload-outline-sharp ml-1" /></button
        >
    </div>

    <div class="accordion-container">
        <Accordion>
            <PyServerControl />
            <WebsocketServerControl />
        </Accordion>
    </div>
    <TerminalBox bind:terminal={$serverInfo} />
</Layout>
