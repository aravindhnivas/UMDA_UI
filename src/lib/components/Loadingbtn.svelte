<script lang="ts">
    import { Alert } from '$utils/stores';
    import { pyServerReady, redis_server_mode } from '$lib/pyserver/stores';
    import { jobStatus, socket, socket_connection_status } from '$lib/websocket/stores';
    import type { CancelTokenSource } from 'axios';
    import { X, Server, Cpu, CalendarCheck } from 'lucide-svelte/icons';
    import computefromServer from '$lib/pyserver/computefromServer';
    import computefromSubprocess from '$lib/pyserver/computefromSubprocess';
    import { serverInfo } from '$pages/settings/utils/stores';

    type Callback = { pyfile: string; args: Record<string, any> } | undefined;

    export let name: string = 'Compute';
    export let callback: () => Promise<Callback | void> | Callback | void;
    export let loading: boolean = false;
    export let subprocess = false;
    export let btn: HTMLButtonElement | undefined = undefined;
    export let id = getID();

    const dispatch = createEventDispatcher();

    let job_id: string[] = [];
    $: current_jobs = job_id.map(id => {
        const data = $jobStatus[id];
        return { id, ...data };
    });

    $: queued_jobs = current_jobs.filter(job => job && job.status === 'queued');
    $: running_jobs = current_jobs.filter(job => job && job.status === 'running');
    // $: completed_jobs = current_jobs.filter(job => job.status === 'completed');
    // $: failed_jobs = current_jobs.filter(job => job.status === 'error');

    $: redis_process_count = running_jobs.length + queued_jobs.length;
    $: redis_loading = redis_process_count > 0;

    let process_count = 0;
    let activate_socket = false;

    $: if ($redis_server_mode && $socket_connection_status === 'connected' && !activate_socket) {
        $socket.on('job_result', async (data: any) => {
            if (job_id.includes(data.job_id)) {
                console.warn(
                    { data },
                    `Job result received from python server via websocket connection 🚀 for ${pyfile}`,
                );
                job_id = job_id.filter(id => id !== data.job_id);
                await tick();
                // dispatch('result', data.result);
                dispatch('result', { dataFromPython: data.result, pyfile, args });
                console.warn('result event dispatched');
            }
        });
        activate_socket = true;
    } else if ($socket_connection_status !== 'disconnected') {
        activate_socket = false;
    }

    let source: CancelTokenSource;
    let pyfile: string;
    let args: Record<string, any>;
    let server_loading = false;
    // let subprocess_loading = false;
    $: subprocess_loading = process_count > 0;

    const run_callback = async (e: Event) => {
        try {
            const target = btn ?? (e.currentTarget as HTMLButtonElement);
            if (!target) return toast.error('No target button');
            if (!$pyServerReady) return toast.error('python server is not yet started');

            const data = await callback();
            if (!data) return;

            pyfile = data.pyfile;
            args = data.args;
            if (subprocess) {
                if ($redis_server_mode) {
                    serverInfo.warn('Using redis-server for computation: ' + $socket_connection_status);

                    if ($socket_connection_status !== 'connected') {
                        return toast.error('Websocket connection not established');
                    }

                    const dataFromPython = await computefromServer<{ job_id: string }>({
                        pyfile,
                        args,
                        scheduler: true,
                    });
                    if (!dataFromPython) return;
                    job_id = [dataFromPython.job_id, ...job_id];
                } else {
                    process_count += 1;
                    const dataFromPython = await computefromSubprocess({
                        pyfile,
                        args,
                        target,
                    });
                    if (!dataFromPython) return;
                    dispatch('result', { dataFromPython, pyfile, args });
                }
            } else {
                const CancelToken = axios.CancelToken;
                source = CancelToken.source();
                server_loading = true;
                const dataFromPython = await computefromServer({
                    pyfile,
                    args,
                    scheduler: false,
                    cancelToken: source.token,
                });
                if (!dataFromPython) return;
                dispatch('result', { dataFromPython, pyfile, args });
            }
        } catch (error) {
            Alert.error(error);
        } finally {
            if (!subprocess) server_loading = false;
            if (process_count > 0) process_count -= 1;
        }
    };

    $: loading = server_loading || subprocess_loading || redis_loading;
</script>

<div class="join">
    <button
        class="btn btn-sm btn-outline join-item"
        on:click={() => {
            if (loading) return toast.error('Operation in progress');
            subprocess = !subprocess;
        }}
    >
        {#if subprocess}
            <Cpu size="20" />
        {:else}
            <Server size="20" />
        {/if}
    </button>

    <button
        {id}
        bind:this={btn}
        class:running={loading}
        class:btn-disabled={server_loading}
        class="btn btn-sm btn-outline ld-ext-right w-max join-item"
        on:click={run_callback}
        on:pyEvent
        on:pyEventClosed
        on:pyEventStderr
        on:pyEventStdout
        on:pyEventSuccess
    >
        {name}
        {#if $redis_server_mode && subprocess}
            <CalendarCheck size="20" />
        {/if}

        {#if $redis_server_mode && redis_process_count > 0}
            <div class="badge">{redis_process_count}</div>
        {:else if process_count > 0}
            <div class="badge">{process_count}</div>
        {/if}
        <div class="ld ld-ring ld-spin" style="color: antiquewhite;"></div>
    </button>
    {#if source && server_loading}
        <button
            class="btn btn-sm btn-error join-item"
            on:click={() => {
                if (!source) return toast.error('No operation to cancel');
                console.log({ source });
                source?.cancel('Operation canceled by the user.');
                toast.error('Operation canceled');
            }}><X /></button
        >
    {/if}
</div>
