<script lang="ts">
    import computePy from '$lib/pyserver/computePy';
    import { dialog } from '@tauri-apps/api';
    import { Loadingbtn } from '$lib/components';
    import LinearProgress from '@smui/linear-progress';
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';

    export let filetype = 'csv';
    export let key = 'data';
    export let data: DataType | null = null;
    export let filename: string;
    export let filetypes = ['csv', 'hdf', 'json', 'parquet'];

    // const filename = localWritable('data_filename', '');
    interface DataType {
        columns: string[];
        nrows: {
            [key: string]: string | number;
        }[];
        shape: number;
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

        const dataFromPython = await computePy<DataType>({
            pyfile: 'training.read_data',
            args: {
                filename,
                filetype,
                key,
                rows,
            },
        });

        if (!dataFromPython) {
            data = null;
            toast.error('Could not access pyfile');
            return;
        }
        data = dataFromPython;
        console.warn({ data, dataFromPython });
        dispatch('load', data);
    };
    let loading = false;
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
            const result = await dialog.open();
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
</div>
<div class="flex gap-1 items-end">
    <CustomSelect label="where" bind:value={rows.where} items={['head', 'tail']} />
    <CustomInput bind:value={rows.value} label="# Rows" type="number" max={rows.max} on:change={() => load_data()} />
    <Loadingbtn bind:loading name="load file" callback={load_data} />
</div>

<slot />

{#if data}
    {#if data?.columns && data?.nrows}
        <div class="alert text-sm p-1">
            <span>Total {data.shape} rows: {data?.nrows.length} rows are displayed below</span>
        </div>
        <div class="overflow-x-auto">
            <DataTable style="width: 100%; max-height: 500px;">
                <Head>
                    <Row>
                        <Cell></Cell>
                        {#each data.columns as column}
                            <Cell>{column}</Cell>
                        {/each}
                    </Row>
                </Head>
                <Body>
                    {#each data.nrows as nrows, index}
                        <Row class="hover:bg-orange-300">
                            <Cell>{index}</Cell>
                            {#each data.columns as column}
                                <Cell>{nrows[column]}</Cell>
                            {/each}
                        </Row>
                    {/each}
                </Body>

                <LinearProgress indeterminate closed={!loading} aria-label="Data is being loaded..." slot="progress" />
            </DataTable>
        </div>
    {/if}
{/if}
