<script lang="ts">
    import { embedding, embeddings, embedd_savefile, embedd_savefile_path, use_PCA } from './stores';
    import { training_file, training_column_name_X } from '../training_file/stores';
    import { NPARTITIONS } from '$lib/stores/system';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import computePy from '$lib/pyserver/computePy';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { CheckCheck, TriangleAlert } from 'lucide-svelte/icons';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Molecule from '$lib/components/Molecule.svelte';
    import Textfield from '@smui/textfield';

    export let id: string = 'main-data-container';
    export let display: string = 'none';

    // $: console.log({ $embedd_savefile_path });
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

    const get_embedd_savefile = async (
        filename: string,
        column_X_name: string,
        embedding_name: string,
        pca: boolean,
    ) => {
        if (!filename) return;
        const name = await path.basename(filename);
        // console.log(name);
        $embedd_savefile =
            name.split('.').slice(0, -1).join('.') +
            `_${column_X_name}_${embedding_name}_embeddings${pca ? '_with_PCA' : ''}`;
    };

    $: get_embedd_savefile($training_file.filename, $training_column_name_X, $embedding, $use_PCA);

    let test_mode = import.meta.env.DEV;
    // let test_mode = true;
    const test_smiles = localWritable('test_smiles', 'CCO');
    let test_result = '';

    const embedd_data = async (e: MouseEvent) => {
        if (!test_mode && !$training_file.filename) {
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

        if (!$training_column_name_X) {
            toast.error('Please provide a column name');
            return;
        }

        if (!test_mode && (await fs.exists(await $embedd_savefile_path))) {
            const overwrite = await dialog.confirm(
                `embedd_savefile ${await path.basename(await $embedd_savefile_path)} already exists. Do you want to overwrite it ?`,
                {
                    title: 'Overwrite ?',
                    type: 'warning',
                },
            );
            if (!overwrite) return;
        }

        dataFromPython = {};

        const pyfile = 'training.embedd_data';
        dataFromPython = await computePy({
            pyfile,
            args: {
                test_mode,
                key: $training_file.key,
                filetype: $training_file.filetype,
                filename: $training_file.filename,
                df_column: $training_column_name_X,
                embedding: $embedding,
                npartitions: $NPARTITIONS,
                test_smiles: $test_smiles,
                pretrained_model_location: $model_and_pipeline_files[$embedding].model_file,
                PCA_pipeline_location: $use_PCA ? $model_and_pipeline_files[$embedding].pipeline_file : null,
                embedd_savefile: $embedd_savefile,
            },
            general: true && !test_mode,
            target: e.target as HTMLButtonElement,
        });

        console.log(dataFromPython);

        if (test_mode && dataFromPython.test_mode) {
            let vec = dataFromPython.test_mode.embedded_vector;
            test_result = `Embedded vector: ${vec.length} dimensions`;
            console.log({ vec });
            test_result += '\n[';

            for (let i = 0; i < vec.length; i += 3) {
                let chunk = vec.slice(i, i + 3).map((v: number) => v.toFixed(10));
                test_result += '\n\t' + chunk.join(',\t');
            }
            test_result += '\n]';
        } else {
            try {
                const results = await fs.readTextFile(pyfile + '.json', {
                    dir: fs.BaseDirectory.AppLog,
                });
                const parsed_result = results ? JSON.parse(results) : null;
                if (!parsed_result) {
                    toast.error('No data returned from python');
                    return;
                }
                console.log({ parsed_result });
                const { invalid_smiles_file } = parsed_result?.file_mode;
                dataFromPython = parsed_result;
                if (!dataFromPython?.file_mode) return;
                const invalid_smiles = await fs.readTextFile(invalid_smiles_file);
                console.log({ invalid_smiles });
                dataFromPython.file_mode.invalid_smiles = invalid_smiles?.split('\n').filter(Boolean) || [];
                console.log({ dataFromPython });
            } catch (error) {
                if (error instanceof Error) toast.error(error.message);
            }
        }
    };

    let dataFromPython: {
        test_mode?: { embedded_vector: number[] };
        file_mode?: {
            name: string;
            shape: number;
            invalid_smiles: string[];
            saved_file: string;
            computed_time: string;
        };
    };
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
        <hr />

        <h3>Loaded training file</h3>
        <div class="flex-center">
            <span class="text-sm">File: </span>
            <div class="badge bg-indigo" class:bg-red={!$training_file.filename}>
                {$training_file.filename || 'No file selected'}
            </div>
        </div>
        <div class="flex-center">
            <span class="text-sm">Column:</span>
            <div class="badge bg-indigo" class:bg-red={!$training_column_name_X}>
                {$training_column_name_X || 'Column not provided'}
            </div>
        </div>
        <hr />
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
            <Molecule bind:smiles={$test_smiles} show_controls={false} />

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
        <div class="flex-center border-1 border-solid border-rounded p-1 w-max">
            <span>PCA</span>
            <input type="checkbox" class="toggle" bind:checked={$use_PCA} />
        </div>
        <div class="grid gap-2 items-center" style="grid-auto-flow: column; grid-template-columns: auto 1fr auto;">
            <CustomSelect label="embedding" bind:value={$embedding} items={embeddings} />
            <div class="grid gap-1">
                <Textfield label="embedd_savefile" bind:value={$embedd_savefile} />
                {#await $embedd_savefile_path then file_path}
                    {#await fs.exists(file_path) then value}
                        {#if value}
                            <span class="flex items-center gap-2 text-sm ml-auto">
                                <TriangleAlert />
                                <span>Embedded file exists</span>
                            </span>
                        {/if}
                    {/await}
                {/await}
            </div>
            <Loadingbtn name="Compute" callback={embedd_data} subprocess={true} />
        </div>
    {/if}

    {#if dataFromPython?.file_mode}
        {@const { invalid_smiles, saved_file, computed_time } = dataFromPython.file_mode}

        <div class=" flex flex-col gap-1">
            {#if saved_file}
                <div role="alert" class="alert alert-info p-2">
                    <CheckCheck />
                    <span class="text-sm">(Computed in {computed_time}) File saved to: {saved_file}</span>
                </div>
            {/if}

            {#if invalid_smiles.length > 0}
                <h3>
                    Could not compute embeddings for {invalid_smiles.length}
                    {$training_column_name_X}
                </h3>
                <ul class="invalid_smi_list px-4 select-text">
                    {#each invalid_smiles as smiles}
                        <li class="select-text">{smiles}</li>
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
        overflow: auto;
        max-width: 60vw;
    }
</style>
