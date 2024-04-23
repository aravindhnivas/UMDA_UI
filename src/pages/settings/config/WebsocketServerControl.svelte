<script lang="ts">
    import { wsport, wsready, stop_websocket, connect_websocket } from '$lib/ws';
    import ServerControl from './ServerControl.svelte';
    import { Panel, Header, Content } from '@smui-extra/accordion';
    import IconButton, { Icon } from '@smui/icon-button';
    import { ChevronDown, ChevronUp } from 'lucide-svelte/icons';
    import computePy from '$lib/pyserver/computePy';

    const start_websocket = async () => {
        await computePy({
            pyfile: 'ws',
            args: { wsport: $wsport },
            general: true,
        });
        connect_websocket();
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
