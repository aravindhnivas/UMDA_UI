<script lang="ts">
    import { NPARTITIONS } from '$lib/stores/system';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import computePy from '$lib/pyserver/computePy';
    import { writable } from '@macfja/svelte-persistent-store';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { CheckCheck } from 'lucide-svelte';
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

    const embedd_data = async (e: MouseEvent) => {
        if (!df_column) {
            toast.error('Please provide a column name');
            return;
        }

        if (!filename) {
            toast.error('Please select a file');
            return;
        }

        dataFromPython = await computePy<EmbeddingResult>({
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
            general: true,
            target: e.target as HTMLButtonElement,
        });

        if (!dataFromPython) {
            toast.error('Could not access pyfile');
            return;
        }
        // console.log(dataFromPython, dataFromPython?.invalid_smiles);

        toast.success(`Data embedded successfully! (${dataFromPython?.name})`);
        return dataFromPython;
    };
    let dataFromPython: EmbeddingResult | undefined;
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

<div class="flex items-end gap-1">
    {#if $auto_fetch_columns}
        <CustomSelect label="column name" bind:value={df_column} items={columns} />
    {:else}
        <div class="flex flex-col gap-1">
            <span class="text-xs pl-1">column name</span>
            <input type="text" class="input input-sm" bind:value={df_column} placeholder="Enter column name" />
        </div>
    {/if}
    <CustomSelect label="embedding" bind:value={embedding} items={embeddings} />
    <div class="flex flex-col gap-1">
        <span class="text-xs pl-1">npartitions</span>
        <input bind:value={$NPARTITIONS} type="number" class="input input-sm" placeholder="Enter dask npartitions" />
    </div>
    <Loadingbtn name="Compute" callback={embedd_data} />
</div>

{#if dataFromPython}
    <div class=" flex flex-col gap-1">
        {#if dataFromPython.saved_file}
            <div role="alert" class="alert alert-info p-2">
                <CheckCheck />
                <span class="text-sm"
                    >(Computed in {dataFromPython.computed_time}) File saved to: {dataFromPython.saved_file}</span
                >
            </div>
        {/if}

        {#if dataFromPython.invalid_smiles?.length}
            <h3>
                Could not compute embeddings for the following {df_column} (total: {dataFromPython.invalid_smiles
                    .length})
            </h3>
            <ul class="invalid_smi_list px-4">
                {#each dataFromPython.invalid_smiles as smiles}
                    <li>{smiles}</li>
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
