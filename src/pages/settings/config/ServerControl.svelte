<script lang="ts">
    import Textfield from '@smui/textfield';
    import { fetchServerROOT, updateServerInfo } from '$lib/pyserver/umdapyServer';
    import { checkNetstat, killPID } from '../utils/network';
    import { serverInfo } from '../utils/stores';
    import { connect_websocket } from '$lib/ws';
    import { AxiosError } from 'axios';
    import { LockKeyhole, RefreshCcw, UnlockKeyhole } from 'lucide-svelte/icons';
    import { Checkbox } from '$lib/components';

    export let port: number;
    export let serverReady: boolean = false;
    export let pids: string[] = [];
    export let startServer: () => void;
    export let stopServer: () => void;
    export let connection: 'ws' | 'http' = 'http';
    export let suppress_warnings: boolean = false;

    let starting_server = false;
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
        <div class="flex gap-2 items-end">
            <button on:click={fetch_port}><RefreshCcw /></button>
            <Textfield disabled={port_lock} type="number" bind:value={port} label="ServerPORT" />
            <button on:click={() => (port_lock = !port_lock)}>
                {#if port_lock}
                    <LockKeyhole />
                {:else}
                    <UnlockKeyhole />
                {/if}
            </button>
        </div>
        <button
            disabled={serverReady || starting_server}
            class="btn btn-sm"
            on:click={async () => {
                starting_server = true;
                try {
                    await startServer();
                } catch (error) {
                    console.log(error);
                    serverInfo.error('Failed to start server');
                }
            }}>Start Server</button
        >
        <button
            class="btn btn-sm btn-error"
            on:click={async () => {
                await stopServer();
                starting_server = false;
            }}>Stop Server</button
        >

        <Checkbox bind:value={suppress_warnings} label="Suppress Python warnings" />
    </div>

    <div class="flex gap-1 items-center">
        {#if connection === 'http'}
            <button
                class="btn btn-sm"
                on:click={async () => {
                    const [err] = await oO(fetchServerROOT());
                    if (err instanceof AxiosError) {
                        console.log(err);
                        serverInfo.error(err.code || 'unknown network error');
                    }
                }}>Check Server connection</button
            >
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
