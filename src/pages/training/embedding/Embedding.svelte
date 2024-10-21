<script lang="ts">
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import Molecule from '$lib/components/Molecule.svelte';
    import { NPARTITIONS, use_dask } from '$lib/stores/system';
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import { training_column_name_X, training_file, loaded_df_columns } from '../training_file/stores';
    import Results from './Results.svelte';
    import {
        embedd_savefile,
        embedd_savefile_path,
        embedding,
        embeddings,
        embeddings_computed,
        model_and_pipeline_files,
        use_PCA,
    } from './stores';
    import LoadedFileInfos from './LoadedFileInfos.svelte';

    export let id: string = 'main-data-container';
    export let display: string = 'none';

    $: if ($embedding && !$model_and_pipeline_files[$embedding]) {
        $model_and_pipeline_files[$embedding] = {
            model_file: '',
            pipeline_file: '',
        };
    }

    const set_embedd_savefile = async (embedding_name: string, pca: boolean) => {
        $embedd_savefile = `${embedding_name}_embeddings${pca ? '_with_PCA' : ''}`;
    };
    $: set_embedd_savefile($embedding, $use_PCA);

    let test_mode = false;
    const test_smiles = localWritable('test_smiles', 'CCO');
    let test_result = '';

    const embedd_data = async () => {
        if (!test_mode && !(await fs.exists(await $current_training_data_file))) {
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

        if (!test_mode && !$training_column_name_X) {
            toast.error('Please provide a column name');
            return;
        }

        if (!test_mode && !$loaded_df_columns.includes($training_column_name_X)) {
            toast.error('Column name not found in the loaded file');
            return;
        }

        const vectors_file = await $embedd_savefile_path;
        if (!test_mode && (await fs.exists(vectors_file))) {
            const overwrite = await dialog.confirm(
                `embedd_savefile ${vectors_file} already exists. Do you want to overwrite it ?`,
                {
                    title: 'Overwrite ?',
                    type: 'warning',
                },
            );
            if (!overwrite) return;
        }

        // dataFromPython = {};
        dataFromPython[$embedding] = null;

        $embeddings_computed = false;
        const pyfile = 'training.embedd_data';
        const final_training_file = await $current_training_data_file;
        return {
            pyfile,
            args: {
                test_mode,
                key: $training_file.key,
                filetype: $training_file.filetype,
                filename: final_training_file,
                df_column: $training_column_name_X,
                embedding: $embedding,
                npartitions: $NPARTITIONS,
                test_smiles: $test_smiles,
                pretrained_model_location: $model_and_pipeline_files[$embedding].model_file,
                PCA_pipeline_location: $use_PCA ? $model_and_pipeline_files[$embedding].pipeline_file : null,
                embedd_savefile: $embedd_savefile,
                vectors_file: vectors_file,
                use_dask: $use_dask,
            },
        };
    };

    const onResult = async (e: CustomEvent) => {
        const { pyfile, args } = e.detail;
        dataFromPython[args.embedding] = e.detail.dataFromPython;

        if (test_mode && dataFromPython[args.embedding].test_mode) {
            let vec = dataFromPython[args.embedding]?.test_mode?.embedded_vector;
            if (!vec) return toast.error('No data returned from python');

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
                const { invalid_smiles_file } = parsed_result?.file_mode;
                if (!parsed_result?.file_mode) return;

                dataFromPython[args.embedding] = parsed_result;
                const invalid_smiles = await fs.readTextFile(invalid_smiles_file);
                if (!dataFromPython[args.embedding]?.file_mode) return toast.error('No data returned from python');
                dataFromPython[args.embedding].file_mode.invalid_smiles =
                    invalid_smiles?.split('\n').filter(Boolean) || [];
                $embeddings_computed = true;
            } catch (error) {
                if (error instanceof Error) toast.error(error.message);
            }
        }
    };

    let dataFromPython = {} as Record<Embedding, EmbeddingState>;
</script>

<div class="grid content-start gap-2 pr-5" {id} style:display>
    <div class="flex justify-between">
        <h2>Embeddings</h2>
        <Checkbox label="Test mode" bind:value={test_mode} />
    </div>

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
        <div class="grid grid-cols-[auto_auto_1fr_auto] items-end gap-2">
            <Checkbox label="PCA" bind:value={$use_PCA} />
            <CustomSelect label="embedding" bind:value={$embedding} items={embeddings} />
            <CustomInput label="Enter SMILES" bind:value={$test_smiles} placeholder="Enter SMILES" />
            <Loadingbtn callback={embedd_data} on:result={onResult} />
        </div>

        <div class="grid items-center gap-1 overflow-auto">
            <Molecule bind:smiles={$test_smiles} show_controls={true} />
            <div>
                <span class="text-lg pl-1">Embedded vector</span>
                <textarea
                    class="textarea textarea-bordered h-[300px] w-full select-text"
                    placeholder="Embedded vector will be shown"
                    readonly
                    value={test_result}
                ></textarea>
            </div>
        </div>
    {:else}
        <Checkbox label="PCA" bind:value={$use_PCA} />
        <div class="flex gap-2 items-end">
            <CustomSelect label="embedding" bind:value={$embedding} items={embeddings} />
            <CustomInput label="Embeddings filename" bind:value={$embedd_savefile} lock={true} />
            <Loadingbtn callback={embedd_data} subprocess={true} on:result={onResult} />
        </div>
    {/if}

    {#if !test_mode}
        <div class="divider"></div>
        <h3>Loaded training file</h3>
        <LoadedFileInfos />
        <span class="badge badge-info">{$training_column_name_X} (train column X) will be used for embedding</span>
        <div class="divider"></div>
    {/if}

    {#if dataFromPython[$embedding]}
        {@const { file_mode, computed_time } = dataFromPython[$embedding]}
        {#if file_mode}
            <Results data={file_mode} {computed_time} />
        {/if}
    {/if}
</div>
