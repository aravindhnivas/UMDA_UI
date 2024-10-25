<script lang="ts">
    import { redis_server_mode, pyServerReady, pyServerURL } from '$lib/pyserver/stores';
    import { jobStatus, socket, socket_connection_status } from '$lib/websocket/stores';
    import Layout from './comp/Layout.svelte';
    import Dashboard from '$pages/settings/dashboards/Dashboard.svelte';
    import { initializeSocket } from '$lib/websocket/utils';

    $: if ($socket_connection_status !== 'connected' && $pyServerReady && $redis_server_mode) {
        initializeSocket();
    }
    onDestroy(() => $socket?.disconnect());
    // $: console.log($socket_connection_status);
</script>

<Layout id="Process-Manager" class="pl-5">
    <h1>Process-Manager</h1>

    <div class="flex gap-2 my-2">
        <button
            class="btn btn-sm btn-outline"
            class:btn-disabled={$socket_connection_status === 'connected'}
            on:click={() => initializeSocket()}>Connect</button
        >
        <button
            class="btn btn-sm btn-error"
            class:btn-disabled={$socket_connection_status !== 'connected'}
            on:click={() => $socket.disconnect()}>Disconnect</button
        >

        <Dashboard name="RQ-Dashboard" url={$pyServerURL + '/rq'} />
    </div>

    {#if $socket_connection_status === 'connected'}
        <div class="status-indicator connected">Connected to server</div>
    {:else if $socket_connection_status === 'disconnected'}
        <div class="status-indicator disconnected">Disconnected from server</div>
    {:else}
        <div class="status-indicator error">Connection error</div>
    {/if}

    <div style="overflow-y: auto; max-height: 500px;">
        <button class="btn btn-sm btn-error" on:click={() => ($jobStatus = {})}>Clear</button>
        {#each Object.entries($jobStatus) as [jobId, status]}
            {#if status.status !== 'completed'}
                <div class="job-status">
                    <h3>Job: {jobId}</h3>
                    <p>Status: {status.status}</p>
                </div>
            {/if}
        {/each}
    </div>
</Layout>

<style>
    .status-indicator {
        padding: 0.5rem;
        margin-bottom: 1rem;
        border-radius: 0.25rem;
    }

    .connected {
        background-color: #d4edda;
        color: #155724;
    }

    .disconnected {
        background-color: #fff3cd;
        color: #856404;
    }

    .error {
        background-color: #f8d7da;
        color: #721c24;
    }

    .job-status {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 0.25rem;
    }
</style>
