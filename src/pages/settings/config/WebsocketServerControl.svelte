<script lang="ts">
    import { pyServerReady } from '$lib/pyserver/stores';
    import { wsport, wsready, stop_websocket, connect_websocket, socket } from '$lib/ws';
    import ServerControl from './ServerControl.svelte';
    import { Panel, Header, Content } from '@smui-extra/accordion';
    import { ChevronDown, ChevronUp } from 'lucide-svelte/icons';
    import computePy from '$lib/pyserver/computePy';
    import { serverInfo } from '../utils/stores';

    const start_websocket = async () => {
        try {
            if (!$pyServerReady) throw new Error('Python server is not ready');
            connect_websocket();
            await computePy({
                pyfile: 'ws',
                args: { wsport: $wsport, action: 'start' },
                general: true,
            });
        } catch (error) {
            if (error instanceof Error) serverInfo.error(error.message);
            serverInfo.error('Failed to start websocket server');
        }
    };

    let open = false;
</script>

<Panel extend bind:open style="background-color: coral;">
    <Header>
        <div class="flex justify-between">
            <span>Websocket</span>
            {#if open}
                <ChevronUp />
            {:else}
                <ChevronDown />
            {/if}
        </div>
    </Header>
    <Content>
        <ServerControl
            startServer={start_websocket}
            stopServer={stop_websocket}
            connection="ws"
            bind:port={$wsport}
            bind:serverReady={$wsready}
        />
    </Content>
</Panel>
