<script lang="ts">
    import computePy from '$lib/pyserver/computePy';
    import { dialog } from '@tauri-apps/api';
    import DataOutput from './DataOutput.svelte';
    import Embeddings from './Embeddings.svelte';
    import { Checkbox, Loadingbtn } from '$lib/components';

    export let id: string;
    export let display: string = 'none';

    const filetypes = ['csv', 'hdf', 'json', 'parquet'];

    let filename = '';
    let filetype = 'csv';
    let key = 'data';
    let only_columns = true;
    let data: DataType = {
        columns: ['Column 1'],
        head: [{ 'Column 1': 1, 'Column 2': 2, 'Column 3': 3 }],
        shape: 0,
    };

    const load_data = async () => {
        if (!filename) {
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
                filename,
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

<div class="h-full overflow-hidden grid content-start gap-1" {id} style:display>
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
    </div>
    <div class="flex gap-1">
        <Checkbox bind:value={only_columns} label="only columns" />
        <Loadingbtn bind:loading class="" name="load file" callback={load_data} />
    </div>
    <DataOutput {data} {loading} />
    <Embeddings columns={data?.columns || []} />
</div>
