<script lang="ts">
    import { suppress_py_warnings } from '$pages/settings/stores';
    import { pyServerReady, pyServerPORT, pyServerFailed } from '$lib/pyserver/stores';
    import { start_and_check_umdapy_with_toast, stopServer, currentPortPID } from '$lib/pyserver/umdapyServer';
    import ServerControl from './ServerControl.svelte';
    import { Panel, Header, Content } from '@smui-extra/accordion';
    import { ChevronDown, ChevronUp } from 'lucide-svelte/icons';
    import { connect_ws, disconnect_ws, send_msg_ws, ws, startServerWS, wsready, stopServerWS } from '$lib/ws';

    let open = true;
    $: console.log({ $wsready });
    // onMount(connect_ws);
    // onDestroy(disconnect_ws);
</script>

<Panel extend bind:open style="background-color: coral;">
    <Header>
        <div class="flex justify-between">
            <span>Python server</span>
            {#if open}
                <ChevronUp />
            {:else}
                <ChevronDown />
            {/if}
        </div>
    </Header>
    <Content>
        <button class="btn btn-sm btn-outline ld-ext-right" on:click={startServerWS} disabled={$wsready}>
            <span>Start WS</span>
            <div class="ld ld-ring ld-spin" style="color: antiquewhite;"></div>
        </button>
        <button class="btn btn-sm btn-success" on:click={connect_ws} disabled={$wsready}>Connect WS</button>
        <button
            class="btn btn-sm btn-info"
            disabled={!$wsready}
            on:click={async () => {
                const args = {
                    name: 'Svelte',
                    age: 25,
                };
                await send_msg_ws(args);
            }}>Send WS</button
        >
        <!-- <button class="btn btn-sm btn-error" on:click={disconnect_ws}>Disconnect WS</button> -->
        <button class="btn btn-sm btn-error" on:click={stopServerWS} disabled={!$wsready}>STOP WS</button>
        <ServerControl
            connection="http"
            bind:port={$pyServerPORT}
            bind:serverReady={$pyServerReady}
            bind:pids={$currentPortPID}
            bind:serverFailed={$pyServerFailed}
            startServer={start_and_check_umdapy_with_toast}
            {stopServer}
            bind:suppress_warnings={$suppress_py_warnings}
        />
    </Content>
</Panel>
