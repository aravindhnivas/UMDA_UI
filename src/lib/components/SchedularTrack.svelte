<script lang="ts">
    import { jobStatus } from '$lib/websocket/stores';
    import { CalendarCheck, Trash2, XCircle } from 'lucide-svelte/icons';
    import Modal from './modal/Modal.svelte';
    import { redis_job_controller } from '$lib/pyserver/computefromServer';

    export let job_id: string[] = [];
    $: current_jobs = job_id.map(id => {
        const data = $jobStatus[id];
        return { jobId: id, ...data };
    });
</script>

<Modal title={'Job Status'}>
    <svelte:fragment slot="button-slot" let:openModal>
        <button class="btn btn-sm btn-outline join-item" on:click={openModal}>
            <CalendarCheck size="20" />
            {#if current_jobs.length > 0}
                <div class="badge">{current_jobs.length}</div>
            {/if}
        </button>
    </svelte:fragment>

    {#if job_id.length > 0}
        <button class="flex m-auto btn btn-sm btn-error mb-2" on:click={() => (job_id = [])}>
            Clear all <Trash2 size="20" />
        </button>
    {/if}

    <div style="overflow-y: auto; max-height: 500px;">
        <div class="grid gap-2">
            {#each current_jobs as { jobId, status } (jobId)}
                <div class="grid border border-black p-2 gap-1 mr-5">
                    <div class="flex items-center justify-between">
                        <div class="text-lg font-bold">Job: {jobId}</div>
                        <button
                            class="btn btn-xs btn-error"
                            on:click={() => {
                                job_id = job_id.filter(id => id !== jobId);
                            }}>Close <XCircle size="20" /></button
                        >
                    </div>
                    <div>
                        <pre>Status: {status}</pre>
                    </div>

                    <div class="flex-gap">
                        {#if status === 'completed'}
                            <button
                                class="btn btn-sm btn-success"
                                on:click={async () => {
                                    const data = await redis_job_controller(jobId, 'job_result');
                                    if (!data) return;
                                    console.warn(data.result);
                                }}>Show result</button
                            >
                        {/if}
                        {#if status !== 'completed'}
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
            {:else}
                <p>No jobs running</p>
            {/each}
        </div>
    </div>
</Modal>
