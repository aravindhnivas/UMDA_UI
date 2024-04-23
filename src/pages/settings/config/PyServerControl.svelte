<script lang="ts">
    import { pyServerReady, pyServerPORT } from '$lib/pyserver/stores';
    import { start_and_check_umdapy_with_toast, stopServer, currentPortPID } from '$lib/pyserver/umdapyServer';
    import ServerControl from './ServerControl.svelte';
    import { Panel, Header, Content } from '@smui-extra/accordion';
    import IconButton, { Icon } from '@smui/icon-button';
    import { ChevronDown, ChevronUp } from 'lucide-svelte/icons';

    let open = true;
</script>

<Panel extend bind:open style="background-color: coral;">
    <Header>
        Python server
        <IconButton slot="icon" toggle pressed={open}>
            <Icon on><ChevronUp /></Icon>
            <Icon><ChevronDown /></Icon>
        </IconButton>
    </Header>
    <Content>
        <ServerControl
            connection="http"
            bind:port={$pyServerPORT}
            bind:serverReady={$pyServerReady}
            bind:pids={$currentPortPID}
            startServer={start_and_check_umdapy_with_toast}
            {stopServer}
        />
    </Content>
</Panel>
