<script lang="ts">
    import { redis_server_mode, pyServerReady, pyServerURL } from '$lib/pyserver/stores';
    import { jobStatus, socket, socket_connection_status } from '$lib/websocket/stores';
    import { redis_job_controller } from '$lib/pyserver/computefromServer';
    import Layout from './comp/Layout.svelte';
    import Dashboard from '$pages/settings/dashboards/Dashboard.svelte';
    import { initializeSocket } from '$lib/websocket/utils';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { Trash2 } from 'lucide-svelte/icons';

    $: if ($socket_connection_status !== 'connected' && $pyServerReady && $redis_server_mode) {
        initializeSocket();
    }
    onDestroy(() => $socket?.disconnect());

    let wait_time = 1;
</script>

<Layout id="Process-Manager" class="pl-5">
    <h1>Process-Manager</h1>
    <div class="flex-gap items-end">
        <CustomInput bind:value={wait_time} label="Wait Time (s)" type="number" />
        <Loadingbtn
            subprocess={true}
            callback={() => {
                return {
                    pyfile: 'wait_timer',
                    args: {
                        wait_time: Number(wait_time),
                    },
                };
            }}
        />
    </div>
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
        <div class="grid gap-2">
            <button class="m-auto btn btn-sm btn-error" on:click={() => ($jobStatus = {})}
                >Clear <Trash2 size="20" /></button
            >
            {#each Object.entries($jobStatus) as [jobId, status]}
                <!-- {#if status.status !== 'completed'} -->
                <div class="grid border border-black p-2 gap-1 mr-5">
                    <div class="text-lg font-bold">Job: {jobId}</div>
                    <div>
                        <pre>Status: {status.status}</pre>
                    </div>

                    <div class="flex-gap">
                        {#if status.status === 'completed'}
                            <button
                                class="btn btn-sm btn-success"
                                on:click={async () => {
                                    const data = await redis_job_controller(jobId, 'job_result');
                                    if (!data) return;
                                    console.warn(data.result);
                                }}>Show result</button
                            >
                        {/if}
                        {#if status.status === 'running'}
                            <button
                                class="btn btn-sm btn-error"
                                on:click={async () => {
                                    const data = await redis_job_controller(jobId, 'cancel_job');
                                    if (!data) return;
                                    console.warn(data.message);
                                }}>Cancel job</button
                            >
                        {/if}
                    </div>
                </div>
                <!-- {/if} -->
            {/each}
        </div>
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
</style>
