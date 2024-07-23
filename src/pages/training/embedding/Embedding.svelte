<script lang="ts">
    import { embedding, embeddings } from './stores';
    import FileLoader from '../FileLoader.svelte';
    import { NPARTITIONS } from '$lib/stores/system';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import computePy from '$lib/pyserver/computePy';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { CheckCheck } from 'lucide-svelte/icons';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Molecule from '$lib/components/Molecule.svelte';

    export let id: string = 'main-data-container';
    export let display: string = 'none';
    // export let columns: string[] = [];

    const model_and_pipeline_files = localWritable<{
        [name: string]: {
            model_file: string;
            pipeline_file: string;
        };
    }>('model_and_pipeline_files', {});

    $: if ($embedding && !$model_and_pipeline_files[$embedding]) {
        $model_and_pipeline_files[$embedding] = {
            model_file: '',
            pipeline_file: '',
        };
    }

    const auto_fetch_columns = localWritable('auto_fetch_columns', false);
    const use_PCA = localWritable('use_PCA', false);

    let test_mode = import.meta.env.DEV;
    // let test_mode = false;
    const test_smiles = localWritable('test_smiles', 'CCO');
    let test_result = '';

    let df_column = 'SMILES';

    const embedd_data = async (e: MouseEvent) => {
        if (!test_mode && !$filename) {
            toast.error('Please select a file');
            return;
        }

        if (!$model_and_pipeline_files[$embedding].model_file) {
            toast.error('Please select a pretrained model');
            return;
        }

        if ($use_PCA && !$model_and_pipeline_files[$embedding].pipeline_file) {
            toast.error('Please select a PCA pipeline');
            return;
        }

        if (!df_column) {
            toast.error('Please provide a column name');
            return;
        }

        dataFromPython = await computePy({
            pyfile: 'training.embedd_data',
            args: {
                key,
                filetype,
                test_mode,
                df_column,
                filename: $filename,
                embedding: $embedding,
                npartitions: $NPARTITIONS,
                test_smiles: $test_smiles,
                pretrained_model_location: $model_and_pipeline_files[$embedding].model_file,
                PCA_pipeline_location: $use_PCA ? $model_and_pipeline_files[$embedding].pipeline_file : null,
            },
            general: true && !test_mode,
            target: e.target as HTMLButtonElement,
        });

        // console.log(dataFromPython);
        let vec = dataFromPython?.embedded_vector[0] ?? dataFromPython?.embedded_vector;
        // if ($use_PCA) vec = dataFromPython?.embedded_vector;

        if (vec) {
            test_result = `Embedded vector: ${vec.length} dimensions`;
            console.log({ vec });
            test_result += '\n[';

            for (let i = 0; i < vec.length; i += 3) {
                let chunk = vec.slice(i, i + 3).map((v: number) => v.toFixed(10));
                test_result += '\n\t' + chunk.join(',\t');
            }
            test_result += '\n]';
        }
    };
    const filename = localWritable('data_filename', '');
    let dataFromPython;
    let data: DataType | null = null;
    let filetype = 'csv';
    let key = 'data';
</script>

<div class="grid content-start gap-2" {id} style:display>
    <div class="flex justify-between">
        <h2>Embeddings</h2>
        <div class="flex-center text-sm">
            <input type="checkbox" class="toggle" bind:checked={test_mode} />
            <span>Test mode</span>
        </div>
    </div>

    {#if !test_mode}
        <h3>Load data file</h3>
        <FileLoader bind:filename={$filename} bind:data bind:filetype bind:key />
    {/if}

    <h3>Pre-trained model ({$embedding})</h3>

    <BrowseFile bind:filename={$model_and_pipeline_files[$embedding].model_file} label="Model" />

    {#if $use_PCA}
        <BrowseFile
            bind:filename={$model_and_pipeline_files[$embedding].pipeline_file}
            label="PCA pipeline"
            helper="Make sure to give a pipeline without kmeans clustering"
        />
    {/if}

    {#if test_mode}
        <div class="flex items-end gap-4">
            <div class="flex-center border-1 border-solid border-rounded p-1">
                <span>PCA</span>
                <input type="checkbox" class="toggle" bind:checked={$use_PCA} />
            </div>
            <CustomSelect label="embedding" bind:value={$embedding} items={embeddings} />
            <div class="flex flex-col gap-1">
                <span class="text-xs pl-1">Enter SMILES</span>
                <input
                    type="text"
                    class="input input-sm w-xl"
                    bind:value={$test_smiles}
                    placeholder="Enter SMILES"
                    on:change={async () => {
                        if (!$test_smiles) return;
                        await embedd_data(new MouseEvent('click'));
                    }}
                />
            </div>
            <Loadingbtn name="Compute" callback={embedd_data} />
        </div>

        <div class="grid grid-cols-4 items-center gap-1">
            <div class="col-span-1 rounded-1" style="background-color: antiquewhite;">
                <Molecule bind:smiles={$test_smiles} />
            </div>

            <div class="col-span-3">
                <span class="text-sm pl-1">Embedded vector</span>
                <textarea
                    class="textarea textarea-bordered h-[300px] w-full select-text"
                    placeholder="Embedded vector will be shown"
                    readonly
                    value={test_result}
                ></textarea>
            </div>
        </div>
    {:else}
        <div class="flex flex-col gap-1">
            <div class="flex-center">
                <div class="flex-center border-1 border-solid border-rounded p-1">
                    <span>Auto-fetch column name</span>
                    <input type="checkbox" class="toggle" bind:checked={$auto_fetch_columns} />
                </div>

                <div class="flex-center border-1 border-solid border-rounded p-1">
                    <span>PCA</span>
                    <input type="checkbox" class="toggle" bind:checked={$use_PCA} />
                </div>
            </div>

            {#if $auto_fetch_columns && !data?.columns.length}
                <span class="text-sm">Load file first!</span>
            {/if}
        </div>

        <div class="flex items-end gap-1">
            {#if $auto_fetch_columns}
                <CustomSelect label="column name" bind:value={df_column} items={data?.columns} />
            {:else}
                <div class="flex flex-col gap-1">
                    <span class="text-xs pl-1">column name</span>
                    <input type="text" class="input input-sm" bind:value={df_column} placeholder="Enter column name" />
                </div>
            {/if}

            <CustomSelect label="embedding" bind:value={$embedding} items={embeddings} />

            <div class="flex flex-col gap-1">
                <span class="text-xs pl-1">npartitions</span>
                <input
                    bind:value={$NPARTITIONS}
                    type="number"
                    class="input input-sm"
                    placeholder="Enter dask npartitions"
                />
            </div>
            <Loadingbtn name="Compute" callback={embedd_data} subprocess={true} />
        </div>
    {/if}

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
</div>

<style>
    .invalid_smi_list {
        list-style-type: none;
        max-height: 300px;
        overflow-y: auto;
    }
</style>
