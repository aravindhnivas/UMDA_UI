<script lang="ts">
    import { wsport, wsready, stop_websocket, connect_websocket, socket } from '$lib/ws';
    import ServerControl from './ServerControl.svelte';
    import { Panel, Header, Content } from '@smui-extra/accordion';
    import IconButton, { Icon } from '@smui/icon-button';
    import { ChevronDown, ChevronUp } from 'lucide-svelte/icons';
    import computePy from '$lib/pyserver/computePy';
    import { serverInfo } from '../utils/stores';

    const start_websocket = async () => {
        try {
            connect_websocket();

            if ($socket && $socket.readyState === 3) {
                await computePy({
                    pyfile: 'ws',
                    args: { wsport: $wsport, action: 'start' },
                    general: true,
                });
            }
        } catch (error) {
            if (error instanceof Error) serverInfo.error(error.message);
            else serverInfo.error('Failed to start websocket server');
        }
    };

    let open = false;
</script>

<Panel extend bind:open style="background-color: coral;">
    <Header>
        Websocket
        <IconButton slot="icon" toggle pressed={open}>
            <Icon on><ChevronUp /></Icon>
            <Icon><ChevronDown /></Icon>
        </IconButton>
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
