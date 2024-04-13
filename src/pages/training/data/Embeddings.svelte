<script lang="ts">
    import { NPARTITIONS } from '$lib/stores/system';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import computePy from '$lib/pyserver/computePy';
    import { writable } from '@macfja/svelte-persistent-store';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import CustomTextbox from '$lib/components/CustomTextbox.svelte';

    export let columns: string[] = [];
    export let filename = '';
    export let filetype = 'csv';
    export let key = 'data';

    const auto_fetch_columns = writable('auto_fetch_columns', false);

    let df_column = 'SMILES';
    const embeddings = ['mol2vec', 'VICGAE'];
    let embedding = embeddings[0];

    let mol2vec_dim = 300;
    let PCA_dim = 70;

    const embedd_data = async () => {
        if (!df_column) {
            toast.error('Please provide a column name');
            return;
        }

        if (!filename) {
            toast.error('Please select a file');
            return;
        }

        const dataFromPython = await computePy<EmbeddingResult>({
            pyfile: 'training.embedd_data',
            args: {
                filename,
                filetype,
                key,
                df_column,
                embedding,
                npartitions: $NPARTITIONS,
                mol2vec_dim,
                PCA_dim,
            },
        });

        if (!dataFromPython) {
            toast.error('Could not access pyfile');
            return;
        }
        toast.success(`Data embedded successfully! (${dataFromPython.name})`);
        return dataFromPython;
    };

    let result: EmbeddingResult;
    // let invalid_smiles: string[] = [];
    // let saved_file = '';

    // const post_process = async (e: CustomEvent<EmbeddingResult>) => {
    //     saved_file = e.detail.saved_file;
    //     invalid_smiles = e.detail.invalid_smiles;
    // };
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
        <CustomSelect label="column" bind:value={df_column} items={columns} />
    {:else}
        <input type="text" class="input input-sm" bind:value={df_column} placeholder="Enter column name" />
    {/if}
    <CustomSelect label="embedding" bind:value={embedding} items={embeddings} />
    <CustomTextbox label="npartitions" bind:value={$NPARTITIONS} type="number" helper="Dask partitions" />
    <Loadingbtn name="Compute" callback={embedd_data} on:result={({ detail }) => (result = detail)} />
</div>

{#if result}
    <div class=" flex flex-col gap-1">
        {#if result.saved_file}
            <span class="alert alert-info">File saved to: {result.saved_file}</span>
        {/if}

        {#if result.invalid_smiles.length}
            <h3>
                Could not compute embeddings for the following {df_column} (total: {result.invalid_smiles.length})
            </h3>
            <ul class="invalid_smi_list px-4">
                {#each result.invalid_smiles as smile}
                    <li>{smile}</li>
                {/each}
            </ul>
        {/if}
    </div>
{/if}

<style>
    .invalid_smi_list {
        list-style-type: none;
        max-height: 300px;
        overflow-y: auto;
    }
</style>
