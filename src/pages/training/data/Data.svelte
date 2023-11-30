<script lang="ts">
    import computePy from '$lib/pyserver/computePy';
    import { dialog } from '@tauri-apps/api';
    import DataOutput from './DataOutput.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';

    export let id: string;
    export let display: string = 'none';

    const filetypes = ['csv', 'hdf', 'json', 'parquet'];

    let filename = '';
    let filetype = 'csv';
    let key = 'data';

    let data = {};

    const load_data = async () => {
        if (!filename) {
            toast.error('Please provide a filename');
            return;
        }

        if (filetype === 'hdf5' && !key) {
            toast.error('Please provide a key');
            return;
        }

        const dataFromPython = await computePy({
            pyfile: 'training.read_data',
            args: {
                filename,
                filetype,
                key,
            },
        });

        if (!dataFromPython) {
            toast.error('Could not access pyfile');
            return Promise.reject('Could not access pyfile');
        }
        data = dataFromPython;
        console.warn(dataFromPython);
    };
</script>

<div class="h-full overflow-hidden grid content-start gap-1" {id} style:display>
    <div class="join">
        <select class="select select-sm select-bordered join-item" bind:value={filetype}>
            <option disabled selected>filetype</option>
            {#each filetypes as filetype}
                <option>{filetype}</option>
            {/each}
        </select>
        <button
            class="btn btn-sm join-item rounded-r-full"
            on:click={async () => {
                const result = await dialog.open();
                if (!result) return;
                if (typeof result === 'string') {
                    filename = result;
                } else {
                    filename = result[0];
                }
            }}>Browse file</button
        >
        <input class="input input-sm input-bordered join-item w-full" placeholder="filename" bind:value={filename} />
        {#if filetype === 'hdf'}
            <input class="input input-sm input-bordered join-item" placeholder="key" bind:value={key} />
        {/if}
        <!-- <button class="button join-item" on:click={load_data}>load</button> -->
        <Loadingbtn class="rounded-l-0 join-item" name="load" callback={load_data} />
    </div>
    <DataOutput {data} />
</div>
