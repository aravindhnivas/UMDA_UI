<script lang="ts">
    import computePy from '$lib/pyserver/computePy';
    import { dialog } from '@tauri-apps/api';
    import { Loadingbtn } from '$lib/components';
    import LinearProgress from '@smui/linear-progress';
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';

    export let filetype = 'csv';
    export let key = 'data';
    export let data: DataType | null = null;
    export let filename: string;
    const filetypes = ['csv', 'hdf', 'json', 'parquet'];

    // const filename = writable_store('data_filename', '');

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
            },
        });

        if (!dataFromPython) {
            data = null;
            toast.error('Could not access pyfile');
            return;
        }
        data = dataFromPython;
        console.warn(dataFromPython);
    };
    let loading = false;
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
    <Loadingbtn bind:loading name="load file" callback={load_data} />
</div>
{#if data}
    {#if data?.columns && data?.head}
        <div class="alert text-sm p-1">
            <span>Total {data.shape} rows: First 10 rows are displayed below</span>
        </div>
        <div class="overflow-x-auto">
            <DataTable table$aria-label="User list" style="width: 100%;">
                <Head>
                    <Row>
                        <Cell></Cell>
                        {#each data.columns as column}
                            <Cell>{column}</Cell>
                        {/each}
                    </Row>
                </Head>
                <Body>
                    {#each data.head as head, index}
                        <Row class="hover:bg-orange-300">
                            <Cell>{index}</Cell>

                            {#each data.columns as column}
                                <Cell>{head[column]}</Cell>
                            {/each}
                        </Row>
                    {/each}
                </Body>

                <LinearProgress indeterminate closed={!loading} aria-label="Data is being loaded..." slot="progress" />
            </DataTable>
        </div>
    {/if}
{/if}
