<script lang="ts">
    import { Loadingbtn } from '$lib/components';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import FileTable from './FileTable.svelte';
    import { ExternalLink, RefreshCcw } from 'lucide-svelte/icons';

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

    let filelocation: string;
    let fname: string;
    let fname_lists: string[] = [];

    const fetch_all_files = async (loc: string) => {
        filelocation = loc;
        const read_dir = await fs.readDir(filelocation);

        fname_lists = read_dir.filter(f => !f.children && f.name?.endsWith(filetype)).map(f => f.name) as string[];
        fname = fname_lists[0];
        if (!fname) {
            filename = '';
            toast.error('No files found');
            return;
        }
        filename = await path.join(filelocation, fname);
    };

    onMount(async () => {
        if (!filename) return;
        filelocation = await path.dirname(filename);
        fname = await path.basename(filename);
        const read_dir = await fs.readDir(filelocation);
        fname_lists = read_dir.filter(f => !f.children && f.name?.endsWith(filetype)).map(f => f.name) as string[];
    });

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
    <button
        class="btn btn-sm btn-outline join-item rounded-0"
        on:click={async () => {
            await fetch_all_files(filelocation);
        }}
    >
        <RefreshCcw size="20" />
    </button>
    <select class="select select-sm select-bordered join-item" bind:value={filetype}>
        <option disabled selected>filetype</option>
        {#each filetypes as filetype}
            <option>{filetype}</option>
        {/each}
    </select>
    {#if filetype === 'hdf'}
        <input
            class="input input-sm input-bordered join-item"
            placeholder="Enter key"
            bind:value={key}
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
        />
    {/if}
    <button
        class="btn btn-sm btn-outline join-item rounded-0"
        on:click={async () => {
            // const filters = filetype === '*' ? [] : [{ name: filetype, extensions: [filetype] }];
            // const result = await dialog.open({ filters, multiple: false });
            const dir = await dialog.open({ directory: true, multiple: false });
            if (!dir) return;
            if (isArray(dir)) return toast.error('Please select a single directory');
            await fetch_all_files(dir);
        }}>Browse Directory</button
    >
    <div class="grid grid-cols-[3fr_1fr] join join-item w-full">
        <input
            class="input input-sm input-bordered join-item"
            placeholder="Browse Directory"
            bind:value={filelocation}
            on:change={async () => {
                filename = await path.join(filelocation, fname);
            }}
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
        />
        <select
            class="select select-sm select-bordered join-item"
            bind:value={fname}
            on:change={async () => {
                filename = await path.join(filelocation, fname);
            }}
        >
            <option disabled selected>files</option>
            {#each fname_lists as _fname}
                <option>{_fname}</option>
            {/each}
        </select>
    </div>

    <button
        class="btn btn-sm btn-outline join-item"
        on:click={async () => {
            if (!filename) return toast.error('No file selected');
            await shell.open(await path.dirname(filename));
        }}><ExternalLink size="20" /></button
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
    <slot name="btn-row"></slot>
</div>

<slot {load_btn} />
<FileTable {data} {loading} />
