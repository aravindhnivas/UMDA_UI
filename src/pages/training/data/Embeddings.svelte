<script lang="ts">
    import { npartitions } from '$lib/pyserver/stores';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import computePy from '$lib/pyserver/computePy';
    import { writable } from '@macfja/svelte-persistent-store';
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';
    import CustomSelect from '$lib/components/CustomSelect.svelte';

    export let columns: string[] = [];
    export let filename = '';
    export let filetype = 'csv';
    export let key = 'data';

    const auto_fetch_columns = writable('auto_fetch_columns', false);

    let df_column = '';
    const embeddings = ['mol2vec', 'VICGAE'];
    let embedding = embeddings[0];

    $: console.log($npartitions);

    const embedd_data = async () => {
        if (!df_column) {
            toast.error('Please provide a column name');
            return;
        }

        if (!filename) {
            toast.error('Please select a file');
            return;
        }

        const dataFromPython = await computePy<DataType>({
            pyfile: 'training.embedd_data',
            args: {
                filename,
                filetype,
                key,
                df_column,
                embedding,
                npartitions: $npartitions || 50,
            },
        });

        if (!dataFromPython) {
            toast.error('Could not access pyfile');
            return;
        }
        // const data = dataFromPython;
        console.warn(dataFromPython);
    };
</script>

<h2>Embeddings</h2>

<div class="flex flex-col gap-1">
    <div class="flex-center">
        <span>Auto-fetch column name</span>
        <input type="checkbox" class="toggle" bind:checked={$auto_fetch_columns} />
    </div>
    {#if $auto_fetch_columns && !columns.length}
        <span class="text-sm">Load file first!</span>
    {/if}
</div>

<div class="flex-center">
    {#if $auto_fetch_columns}
        <CustomSelect label="column" value={df_column} items={columns} />
    {:else}
        <input type="text" class="input input-sm" bind:value={df_column} placeholder="Enter column name" />
    {/if}
    <CustomSelect label="embedding" value={embedding} items={embeddings} />

    <div>
        <Textfield bind:value={$npartitions} label="npartitions" type="number">
            <HelperText persistent slot="helper">Dask partitions (Default: 50)</HelperText>
        </Textfield>
    </div>
    <Loadingbtn name="Compute" callback={embedd_data} />
</div>
