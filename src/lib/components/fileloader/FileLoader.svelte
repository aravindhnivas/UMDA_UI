<script lang="ts">
    import { dialog } from '@tauri-apps/api';
    import { Loadingbtn } from '$lib/components';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import FileTable from './FileTable.svelte';
    import { ExternalLink } from 'lucide-svelte/icons';

    export let filetype = 'csv';
    export let key = 'data';
    export let data: DataType | null = null;
    export let filename: string;
    export let use_dask = false;
    export let filetypes = ['csv', 'smi', 'hdf', 'json', 'parquet', '*'];

    interface DataType {
        columns: string[];
        nrows: {
            [key: string]: string | number;
        }[];
        shape: number;
        index_name: string;
    }

    const dispatch = createEventDispatcher();

    const load_data = async () => {
        if (!filename) {
            toast.error('Please provide a filename');
            return;
        }

        if (!(await fs.exists(filename))) {
            toast.error('File does not exist');
            return;
        }

        if (filetype === 'hdf5' && !key) {
            toast.error('Please provide a key');
            return;
        }

        if (rows.value > rows.max) {
            toast.error('Please provide a value less than or equal to ' + rows.max);
            return;
        }
        return {
            pyfile: 'training.read_data',
            args: {
                filename,
                filetype,
                key,
                rows,
                use_dask,
            },
        };
    };
    let loading = false;
    let load_btn: HTMLButtonElement;
    const rows = {
        value: 10,
        min: 10,
        max: 100,
        where: 'head',
    };
</script>

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
            const filters = filetype === '*' ? [] : [{ name: filetype, extensions: [filetype] }];
            const result = await dialog.open({ filters, multiple: false });
            if (!result) return;
            if (typeof result === 'string') {
                filename = result;
            } else {
                filename = result[0];
            }
        }}>Browse file</button
    >
    <input class="input input-sm input-bordered join-item w-full" placeholder="Enter filename" bind:value={filename} />
    {#if filetype === 'hdf'}
        <input class="input input-sm input-bordered join-item" placeholder="Enter key" bind:value={key} />
    {/if}
    <button
        class="btn btn-sm join-item"
        on:click={async () => {
            if (!filename) return toast.error('No file selected');
            await shell.open(await path.dirname(filename));
        }}><ExternalLink /></button
    >
</div>

<div class="flex gap-1 items-end">
    <CustomSelect label="where" bind:value={rows.where} items={['head', 'tail']} />
    <CustomInput bind:value={rows.value} label="# Rows" type="number" max={rows.max} on:change={() => load_data()} />
    <Checkbox bind:value={use_dask} label="Use dask" check="checkbox" />
    <Loadingbtn
        bind:btn={load_btn}
        bind:loading
        name="load file"
        callback={load_data}
        on:result={e => {
            console.log(e.detail);
            const { dataFromPython } = e.detail;
            data = dataFromPython;
            dispatch('load', data);
            toast.success(`${filename} loaded successfully`);
        }}
    />
</div>

<slot {load_btn} />
<FileTable {data} {loading} />
