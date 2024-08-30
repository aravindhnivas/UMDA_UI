<script lang="ts">
    import Textfield from '@smui/textfield';
    import { fetchServerROOT, updateServerInfo } from '$lib/pyserver/umdapyServer';
    import { checkNetstat, killPID } from '../utils/network';
    import { serverInfo } from '../utils/stores';
    import { connect_websocket, socket } from '$lib/ws';

    export let port: number;
    export let serverReady: boolean = false;
    export let pids: string[] = [];
    export let startServer: () => void;
    export let stopServer: () => void;
    export let connection: 'ws' | 'http' = 'http';

    const killpids = async () => {
        if (!pids.length) return serverInfo.error('No PID to kill');
        await killPID(pids);
        serverReady = false;
        await updateServerInfo();
    };

    let port_lock = true;
    const fetch_port = async () => {
        if (port_lock) throw toast.warning('Port is locked');
        const _port = await invoke<number>('get_tcp_port');
        if (_port) port = _port;
        throw toast.error('Failed to fetch port');
    };
</script>

<div class="grid gap-1">
    <div class="flex items-center gap-1">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <i on:click={fetch_port} class="i-material-symbols-refresh"></i>

        <Textfield disabled={port_lock} type="number" bind:value={port} label="ServerPORT" />

        {#if port_lock}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <i on:click={() => (port_lock = false)} class="i-material-symbols-lock-outline"></i>
        {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <i on:click={() => (port_lock = true)} class="i-material-symbols-lock-open-right-outline"></i>
        {/if}

        <button disabled={serverReady} class="btn btn-sm" on:click={startServer}>Start Server</button>
        <button class="btn btn-sm btn-error" on:click={stopServer}>Stop Server</button>
    </div>
    <div class="flex gap-1 items-center">
        {#if connection === 'http'}
            <button class="btn btn-sm" on:click={async () => await fetchServerROOT()}>Check Server connection</button>
        {:else}
            <button class="btn btn-sm" on:click={connect_websocket}>Check ws connection</button>
        {/if}
        <button class="btn btn-sm" on:click={async () => await checkNetstat(port)}>Check PORT status</button>

        <Textfield
            value={pids.join(', ')}
            label="current port PID"
            on:change={e => {
                // console.log(e.target.value, pids);
                if (pids.length === 0 && e.target.value) {
                    pids = e.target.value.split(',');
                }
                // console.log(pids);
            }}
        />
        <button class="btn btn-sm btn-error" on:click={killpids}>kill PID</button>
    </div>
</div>
