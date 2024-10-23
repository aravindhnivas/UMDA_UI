<script lang="ts">
    import { connect_ws, send_msg_ws, startServerWS, wsready, stopServerWS } from '$lib/websocket/tauri-ws';
</script>

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
