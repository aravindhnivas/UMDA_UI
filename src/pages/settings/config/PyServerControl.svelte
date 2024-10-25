<script lang="ts">
    import { suppress_py_warnings } from '$pages/settings/stores';
    import { pyServerURL } from '$lib/pyserver/stores';
    import { pyServerReady, pyServerPORT, pyServerFailed, serverDebug } from '$lib/pyserver/stores';
    import { start_and_check_umdapy_with_toast, stopServer, currentPortPID } from '$lib/pyserver/umdapyServer';
    import ServerControl from './ServerControl.svelte';
    import { Panel, Header, Content } from '@smui-extra/accordion';
    import { ChevronDown, ChevronUp } from 'lucide-svelte/icons';
    import Dashboard from '$pages/settings/dashboards/Dashboard.svelte';

    let open = true;
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
        <div class="grid gap-2">
            <ServerControl
                connection="http"
                bind:port={$pyServerPORT}
                bind:serverReady={$pyServerReady}
                bind:pids={$currentPortPID}
                bind:serverFailed={$pyServerFailed}
                startServer={start_and_check_umdapy_with_toast}
                {stopServer}
                bind:suppress_warnings={$suppress_py_warnings}
                bind:debug={$serverDebug}
            />
            <div class="flex">
                <Dashboard name="Server-Dashboard" url={$pyServerURL} />
            </div>
        </div>
    </Content>
</Panel>
