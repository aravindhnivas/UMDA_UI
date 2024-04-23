<script lang="ts">
    import { pyServerPORT, serverDebug, pyServerReady } from '$lib/pyserver/stores';
    import { Checkbox } from '$components/index';
    import Textfield from '@smui/textfield';
    import {
        currentPortPID,
        fetchServerROOT,
        start_and_check_umdapy_with_toast,
        stopServer,
        updateServerInfo,
    } from '$lib/pyserver/umdapyServer';
    import { checkNetstat, killPID } from '../utils/network';
    import TerminalBox from '$lib/components/TerminalBox.svelte';
    import { LOGGER } from '$lib/utils/logger';

    export let terminal: LOGGER;
    let port_lock = true;
    const fetch_port = async () => {
        if (port_lock) throw toast.warning('Port is locked');
        const port = await invoke<number>('get_tcp_port');
        if (port) $pyServerPORT = port;
        throw toast.error('Failed to fetch port');
    };
</script>

<div class="grid gap-1">
    <div class="flex items-center gap-1">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <i on:click={fetch_port} class="i-material-symbols-refresh"></i>

        <Textfield disabled={port_lock} type="number" bind:value={$pyServerPORT} label="ServerPORT" />

        {#if port_lock}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <i on:click={() => (port_lock = false)} class="i-material-symbols-lock-outline"></i>
        {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <i on:click={() => (port_lock = true)} class="i-material-symbols-lock-open-right-outline"></i>
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
        <button class="btn btn-sm" on:click={async () => await checkNetstat($pyServerPORT)}>Check PORT status</button>

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
        <button
            class="btn btn-sm btn-error"
            on:click={async () => {
                await killPID($currentPortPID);
                pyServerReady.set(false);
                await updateServerInfo();
            }}>kill PID</button
        >
    </div>
    <TerminalBox bind:terminal />
</div>
