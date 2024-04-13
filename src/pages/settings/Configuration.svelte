<script lang="ts">
    import {
        developerMode,
        port_lock,
        pyServerPORT,
        serverCurrentStatus,
        serverDebug,
        pythonpath,
        pythonscript,
        pyServerReady,
        pyVersion,
        umdapyVersion,
    } from '$lib/pyserver/stores';
    import { BrowseBtn, Checkbox } from '$components/index';
    import Textfield from '@smui/textfield';
    import Layout from './comp/Layout.svelte';
    import {
        currentPortPID,
        fetchServerROOT,
        start_and_check_umdapy_with_toast,
        stopServer,
    } from '$lib/pyserver/umdapyServer';
    import { checkNetstat, killPID } from './utils/network';
    import { serverInfo } from './utils/stores';
    import { getPyVersion } from './utils/checkPython';
    // import ConsoleBox from '$lib/components/ConsoleBox.svelte';
    import { install_umdapy_from_zipfile } from './utils/download-assets';
    import { check_umdapy_assets_status } from './utils/assets-status';
    import TerminalBox from '$lib/components/TerminalBox.svelte';

    const fetch_port = async () => {
        if ($port_lock) return toast.warning('Port is locked');
        const port = await invoke<number>('get_tcp_port');
        if (port) $pyServerPORT = port;
        else toast.error('Failed to fetch port');
    };

    const get_local_dir = async () => {
        try {
            const localdir = await path.appLocalDataDir();
            console.log(localdir);
            await shell.open(localdir);
        } catch (error) {
            toast.error(error as string);
        }
    };
    let terminalDiv: HTMLDivElement;
    onMount(async () => {
        serverInfo.init(terminalDiv);
        if (import.meta.env.DEV) {
            if (!$pyServerReady) {
                const [err] = await oO(fetchServerROOT());
                if (err) {
                    console.error(err);
                }
            }
        }
    });
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

        <button
            class="btn btn-sm ml-auto"
            on:click={async () => {
                await oO(install_umdapy_from_zipfile());
            }}>Install from ZIPfile <i class="i-material-symbols-drive-folder-upload-outline-sharp ml-1" /></button
        >
    </div>

    <div class="flex items-center gap-1">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <i on:click={fetch_port} class="i-material-symbols-refresh"></i>

        <Textfield disabled={$port_lock} type="number" bind:value={$pyServerPORT} label="ServerPORT" />

        {#if $port_lock}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <i on:click={() => ($port_lock = false)} class="i-material-symbols-lock-outline"></i>
        {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <i on:click={() => ($port_lock = true)} class="i-material-symbols-lock-open-right-outline"></i>
        {/if}

        <button
            disabled={$pyServerReady}
            class="btn btn-sm"
            id="startServerButton"
            on:click={start_and_check_umdapy_with_toast}>Start Server</button
        >
        <button class="btn btn-sm btn-error" id="stopServerButton" on:click={async () => await stopServer()}
            >Stop Server</button
        >

        <Checkbox class="ml-auto" bind:value={$serverDebug} label="debug" />
    </div>

    <div class="flex gap-1 items-center">
        <button class="btn btn-sm" on:click={async () => await fetchServerROOT()}>Check Server connection</button>
        <button class="btn btn-sm" on:click={async () => await checkNetstat()}>Check PORT status</button>

        <Textfield
            value={$currentPortPID.join(', ')}
            label="current port PID"
            on:change={e => {
                // console.log(e.target.value, $currentPortPID);

                if ($currentPortPID.length === 0 && e.target.value) {
                    $currentPortPID = e.target.value.split(',').map(Number);
                }
                // console.log($currentPortPID);
            }}
        />
        <button class="btn btn-sm btn-error" on:click={async () => await killPID()}>kill PID</button>
    </div>
    <TerminalBox bind:terminalDiv bind:terminal={$serverInfo} />
</Layout>
