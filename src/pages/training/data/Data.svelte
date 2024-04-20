<script lang="ts">
    // import { writable } from '@macfja/svelte-persistent-store';
    import computePy from '$lib/pyserver/computePy';
    import { dialog } from '@tauri-apps/api';
    import DataOutput from './DataOutput.svelte';
    import Embeddings from './Embeddings.svelte';
    import { Loadingbtn } from '$lib/components';

    export let id: string = 'main-data-container';
    export let display: string = 'none';

    const filetypes = ['csv', 'hdf', 'json', 'parquet'];

    const filename = writable_store('data_filename', '');
    let filetype = 'csv';
    let key = 'data';
    let only_columns = false;
    let data: DataType;

    const load_data = async () => {
        if (!$filename) {
            toast.error('Please provide a filename');
            return;
        }

        if (filetype === 'hdf5' && !key) {
            toast.error('Please provide a key');
            return;
        }

        const dataFromPython = await computePy<DataType>({
            pyfile: 'training.read_data',
            args: {
                filename: $filename,
                filetype,
                key,
                only_columns,
            },
        });

        if (!dataFromPython) {
            toast.error('Could not access pyfile');
            return;
        }
        data = dataFromPython;
        console.warn(dataFromPython);
    };
    let loading = false;
</script>

<div class="grid content-start gap-2" {id} style:display>
    <div class="join">
        <select class="select select-sm select-bordered join-item" bind:value={filetype}>
            <option disabled selected>filetype</option>
            {#each filetypes as filetype}
                <option>{filetype}</option>
            {/each}
        </select>
        <button
            class="btn btn-sm join-item rounded-0"
            on:click={async () => {
                const result = await dialog.open();
                if (!result) return;
                if (typeof result === 'string') {
                    $filename = result;
                } else {
                    $filename = result[0];
                }
            }}>Browse file</button
        >
        <input
            class="input input-sm input-bordered join-item w-full"
            placeholder="Enter filename"
            bind:value={$filename}
        />
        {#if filetype === 'hdf'}
            <input class="input input-sm input-bordered join-item" placeholder="Enter key" bind:value={key} />
        {/if}
        <Loadingbtn bind:loading name="load file" callback={load_data} />
    </div>
    {#if data}
        <DataOutput {data} {loading} />
    {/if}
    <Embeddings columns={data?.columns || []} {...{ filename: $filename, filetype, key }} />
</div>
