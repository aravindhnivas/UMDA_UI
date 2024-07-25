<script lang="ts">
    import {
        model,
        current_model,
        hyperparameters,
        parameters,
        default_param_values,
        fine_tune_model,
        fine_tuned_hyperparameters,
        variable_type,
    } from './stores';
    import { NPARTITIONS } from '$lib/stores/system';
    import { embedd_savefile_path } from '../embedding/stores';
    import supervised_ml_models from '$lib/config/supervised_ml_models.yml';
    import { Loadingbtn } from '$lib/components';
    import { RotateCcw, Save, Upload } from 'lucide-svelte/icons';
    import Accordion from '@smui-extra/accordion';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import ModelParameters from './ModelParameters.svelte';
    import Notification from '$lib/components/Notification.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import Textfield from '@smui/textfield';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { training_column_name_y, training_file } from '../training_file/stores';
    import Plot from 'svelte-plotly.js';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    const unique_id = getID();
    setContext('unique_id', unique_id);

    const set_model_params = () => {
        console.log('Setting model params', $current_model, $model);
        if (!$model) return;
        if (!$current_model) return;

        console.log($hyperparameters, $parameters);
        // Set the default values if they don't exist
        $hyperparameters[$model] ??= structuredClone($default_param_values.hyperparameters);
        $parameters[$model] ??= structuredClone($default_param_values.parameters);

        // setting fine tuned hyperparameters
        $fine_tuned_hyperparameters[$model] ??= {};
        Object.keys($current_model.hyperparameters).forEach(f => {
            $fine_tuned_hyperparameters[$model][f] ??= structuredClone($current_model.hyperparameters[f].fine_tune);
        });
        console.log($hyperparameters, $parameters);
        console.log('fine tuned hyperparameters values', $fine_tuned_hyperparameters);

        // Set the pre-trained model filename
        $pre_trained_filename = `${$model}_pretrained_model`;
    };

    onMount(() => {
        set_model_params();
    });

    const fit_function = async (e: Event) => {
        const vectors_file = await $embedd_savefile_path;
        if (!(await fs.exists(vectors_file))) {
            return toast.error('Error: Embeddings vector file not found');
        }

        if (!(await fs.exists($training_file.filename))) {
            return toast.error('Error: Training file not found');
        }

        if (!$training_column_name_y) {
            return toast.error('Error: Column Y not provided. Set it in the training file');
        }

        let clonedFineTunedValues: Record<string, any> = {};

        if ($fine_tune_model) {
            if (!$fine_tuned_hyperparameters[$model]) {
                toast.error('Error: Fine tuned hyperparameters not found');
                return;
            }

            Object.keys($fine_tuned_hyperparameters[$model]).forEach(f => {
                const val = structuredClone($fine_tuned_hyperparameters[$model][f]);
                clonedFineTunedValues[f] = val.split(',').map(f => {
                    f = f.trim();
                    try {
                        if (f === 'true' || f === 'false' || f === 'null') return JSON.parse(f);
                        if (!isNaN(Number(f))) return Number(f);
                        return f;
                    } catch (error) {
                        console.error('Error parsing', f, error);
                    }
                });
                console.log(f, val, clonedFineTunedValues[f]);
            });
            console.log('fine tuned values', clonedFineTunedValues);
            if (isEmpty(clonedFineTunedValues)) {
                toast.error('Error: Fine tuned hyperparameters not found');
                return;
            }
            // return;
        }

        $pre_trained_filename = $pre_trained_filename.trim();
        $pre_trained_file_loc = $pre_trained_file_loc.trim();

        if (!(await fs.exists($pre_trained_file_loc))) {
            toast.error('Error: Save location does not exist');
            return;
        }

        const unique_spl_name = getID(5);

        const filename = $pre_trained_filename.split('.pkl')[0] + `_${unique_spl_name}_`;
        const pre_trained_file = await path.join($pre_trained_file_loc, filename);

        if (await fs.exists(pre_trained_file)) {
            const overwrite = await dialog.confirm(
                $pre_trained_filename + ': Pre trained model file already exists. Do you want to overwrite it?',
                'Overwrite file',
            );
            if (!overwrite) return;
        }

        const values = structuredClone({ ...$hyperparameters[$model], ...$parameters[$model] });
        let clonedValues: Record<string, string | boolean | number | null> = {};
        console.log({ values, $variable_type });

        if (!$fine_tune_model) {
            Object.entries(values).forEach(([key, value]) => {
                // console.log(key, value, typeof value);
                if (typeof value !== 'string') {
                    if (value === undefined) {
                        clonedValues[key] = null;
                        return;
                    }
                    clonedValues[key] = value;
                    return;
                }

                if (value === 'float') {
                    const input = document.getElementById(`${unique_id}_${key}`) as HTMLInputElement;

                    if (!input) {
                        toast.error(`Error: ${key} input not found`);
                        return;
                    }
                    const val = parseFloat(input.value);

                    if (isNaN(val)) {
                        toast.error(`Error: ${key} input is not a number. Please enter a valid number`);
                        return;
                    }
                    clonedValues[key] = val;
                }

                if (value.trim() === '') {
                    clonedValues[key] = null;
                }

                if (!isNaN(Number(value))) {
                    if ($variable_type[key] === 'float') clonedValues[key] = parseFloat(value);
                    else if ($variable_type[key] === 'integer') clonedValues[key] = parseInt(value);
                }
            });
        }

        console.log({ clonedValues });
        // return;
        const args = {
            model: $model,
            parameters: clonedValues,
            fine_tuned_hyperparameters: clonedFineTunedValues,
            fine_tune_model: $fine_tune_model,
            bootstrap,
            bootstrap_nsamples: Number($bootstrap_nsamples),
            noise_scale: Number($noise_scale),
            kfold_nsamples: Number($kfold_nsamples),
            test_size: Number(test_size) / 100,
            pre_trained_file,
            training_column_name_y: $training_column_name_y,
            training_file: $training_file,
            npartitions: Number($NPARTITIONS),
            vectors_file,
        };

        console.log(args);
        results = null;
        plot_data = [];

        const dataFromPython = await computePy({
            pyfile: 'training.ml_model',
            args,
            general: true,
            target: e.target as HTMLButtonElement,
        });

        console.log({ dataFromPython });
        console.log('Training completed');

        const result_file = pre_trained_file + '.json';
        console.log('Pre-trained file', result_file);
        if (await fs.exists(result_file)) {
            toast.success('Model trained successfully');
            try {
                const saved_file_contents = await fs.readTextFile(result_file);
                results = JSON.parse(saved_file_contents);
                if (!results) {
                    toast.error('Error: Results not found');
                    return;
                }

                open_result_panel = true;

                plot_data = [
                    {
                        x: results.y_true,
                        y: results.y_pred,
                        mode: 'markers',
                        type: 'scatter',
                    },
                ];
            } catch (error) {
                toast.error('Error saving results\n' + error);
            }
        } else {
            toast.error('Error: Model not saved');
        }
    };

    let plot_data: Plotly.Data[] = [];
    let results: {
        r2: number;
        mse: number;
        rmse: number;
        mae: number;
        y_pred: number[];
        y_true: number[];
        cv_results?: Record<string, any>;
        best_params?: Record<string, string | number | boolean | null>;
        best_score?: number;
    } | null = null;

    let open_result_panel = false;
    let savedfile: string;
    let uploadedfile: { fullname: string; name: string; model: string } | null = null;

    const save_parameters = async () => {
        const saveloc = await dialog.save({
            title: 'Save parameters',
            filters: [{ name: 'JSON', extensions: ['json'] }],
            defaultPath: `./${$model}.json`,
        });

        if (!saveloc) return;
        savedfile = saveloc;

        const save_content = JSON.stringify(
            {
                values: { hyperparameters: $hyperparameters[$model], parameters: $parameters[$model] },
                model: $model,
                time: new Date().toISOString(),
            },
            null,
            4,
        );
        await fs.writeTextFile(savedfile, save_content);

        // Show a success notification
        toast.success('Parameters saved successfully');
    };

    const upload_parameters = async () => {
        // Upload the parameters from the backend
        const selected = await dialog.open({
            title: 'Upload parameters',
            filters: [{ name: 'JSON', extensions: ['json'] }],
            defaultPath: `./${$model}.json`,
        });
        let uploadloc = selected;
        if (Array.isArray(selected)) {
            // user selected multiple files
            uploadloc = selected[0];
        } else if (selected === null) {
            // user cancelled the selection
            return;
        } else {
            // user selected a single file
            uploadloc = selected;
        }

        uploadedfile = null;

        const contents = await fs.readTextFile(uploadloc);
        try {
            const parsed = JSON.parse(contents);

            if ($model !== parsed.model) {
                toast.error('Error: Model mismatch');
                return;
            }
            const basefilename = await path.basename(uploadloc);
            uploadedfile = {
                fullname: uploadloc,
                name: basefilename,
                model: parsed.model,
            };

            $hyperparameters[$model] = parsed.values.hyperparameters;
            $parameters[$model] = parsed.values.parameters;
            toast.success('Parameters uploaded successfully');
        } catch (e) {
            toast.error('Error: Invalid JSON file');
        }
    };

    const reset_parameters = () => {
        uploadedfile = null;
        $hyperparameters[$model] = structuredClone($default_param_values.hyperparameters);
        $parameters[$model] = structuredClone($default_param_values.parameters);
    };

    let bootstrap = true;
    let test_size = 20;

    const kfold_nsamples = localWritable('kfold_nsamples', 5);
    const bootstrap_nsamples = localWritable('bootstrap_nsamples', 800);
    const noise_scale = localWritable('noise_scale', 0.5);

    const pre_trained_file_loc = localWritable('pre_trained_file_loc', '');
    const pre_trained_filename = localWritable('pre_trained_filename', '');

    $: if ($model) set_model_params();
</script>

<div {id} style:display class="grid content-start gap-2">
    <h2>ML model training</h2>

    <Accordion multiple>
        <CustomPanel title="Loaded training file" open={true}>
            <div class="grid gap-2">
                <div class="flex-center">
                    <span class="text-sm">Training file: </span>
                    <div class="badge" class:bg-red={!$training_file.filename}>
                        {$training_file.filename || 'No file selected'}
                    </div>
                </div>
                <div class="flex-center">
                    <span class="text-sm">Embedded vector file (train_X): </span>
                    {#await $embedd_savefile_path then value}
                        <div class="badge" class:bg-red={!value}>
                            {value || 'No file selected'}
                        </div>
                    {/await}
                </div>
                <div class="flex-center">
                    <span class="text-sm">Column (train_y):</span>
                    <div class="badge" class:bg-red={!$training_column_name_y}>
                        {$training_column_name_y || 'Column not provided'}
                    </div>
                </div>
            </div>
        </CustomPanel>

        <CustomPanel title="Control" open={true}>
            <div class="flex gap-2 justify-between">
                <div class="grid gap-1">
                    <input class="range w-xs" type="range" min="5" max="95" step="5" bind:value={test_size} />
                    <span>split: {test_size}% test : {100 - test_size}% train</span>
                    {#if test_size > 50}
                        <div class="badge badge-sm badge-warning">Warning: Test split ratio is greater than 50%</div>
                    {/if}
                </div>

                <div class="flex gap-2 items-center">
                    <div class="grid justify-items-end">
                        <Checkbox bind:value={$fine_tune_model} label="fine-tune hyperparameters" check="checkbox" />
                        {#if $fine_tune_model}
                            <Textfield
                                bind:value={$kfold_nsamples}
                                input$min="2"
                                label="# Split (N-fold)"
                                type="number"
                            />
                        {/if}
                    </div>
                    <div class="grid justify-items-end">
                        <Checkbox bind:value={bootstrap} label="bootstrap" check="checkbox" />
                        {#if bootstrap}
                            <div class="flex gap-2">
                                <Textfield bind:value={$bootstrap_nsamples} label="Number of samples" type="number" />
                                <Textfield
                                    bind:value={$noise_scale}
                                    label="noise"
                                    type="number"
                                    input$step="0.1"
                                    input$min="0"
                                    input$max="1"
                                />
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </CustomPanel>

        <CustomPanel title="MODEL: {$current_model.name}" open={true}>
            <div class="grid gap-2">
                <TabBar tabs={Object.keys(supervised_ml_models)} let:tab bind:active={$model}>
                    <Tab {tab}>
                        <Label><span class="text-black">{tab}</span></Label>
                    </Tab>
                </TabBar>
                <span class="text-sm">{$current_model.description}</span>
                {#if $current_model}
                    <div class="flex">
                        <h3>
                            <span>Hyperparameters</span>
                            {#if uploadedfile && uploadedfile.model === $model}
                                <div class="badge badge-sm badge-info">loaded: {uploadedfile.name}</div>
                            {/if}
                        </h3>
                        <div class="ml-auto">
                            <button class="btn btn-sm" on:click={reset_parameters}>
                                <RotateCcw />
                                <span>Reset</span>
                            </button>
                            <button class="btn btn-sm" on:click={upload_parameters}>
                                <Upload />
                                <span>Upload</span>
                            </button>
                            <button class="btn btn-sm" on:click={save_parameters}>
                                <Save />
                                <span>Save</span>
                            </button>
                        </div>
                    </div>
                {/if}
            </div>

            {#if $hyperparameters?.[$model]}
                <ModelParameters key="hyperparameters" bind:values={$hyperparameters[$model]} />
            {:else}
                <Notification message="No hyperparameters found" type="error" />
            {/if}
        </CustomPanel>

        <CustomPanel title="More options">
            {#if $parameters?.[$model]}
                <ModelParameters key="parameters" bind:values={$parameters[$model]} />
            {:else}
                <Notification message="No parameters found" type="error" />
            {/if}
        </CustomPanel>

        <CustomPanel title="Save Model">
            <div class="grid gap-2">
                <BrowseFile directory={true} bind:filename={$pre_trained_file_loc} label="Save trained model" />
                <Textfield bind:value={$pre_trained_filename} label="save filename (.pkl)" />
            </div>
        </CustomPanel>

        <CustomPanel title="Results" bind:open={open_result_panel}>
            {#if results}
                <div class="grid gap-2">
                    <span>R2: {results.r2}</span>
                    <span>MSE: {results.mse}</span>
                    <span>RMSE: {results.rmse}</span>
                    <span>MAE: {results.mae}</span>
                </div>

                {#if results?.best_params}
                    <hr />
                    <div class="grid gap-2">
                        <h3>Best parameters</h3>
                        {#each Object.entries(results.best_params) as [key, value]}
                            <span>{key}: {value}</span>
                        {/each}
                        <span>Best score: {results.best_score}</span>
                    </div>
                {/if}

                <div class="plot__div">
                    <div class="plot w-xl h-lg">
                        <Plot
                            data={plot_data}
                            layout={{
                                xaxis: { title: 'y_true' },
                                yaxis: { title: 'y_pred' },
                                margin: { t: 0 },
                            }}
                            fillParent={true}
                            debounce={250}
                        />
                    </div>
                </div>
            {/if}
        </CustomPanel>
    </Accordion>
    <Loadingbtn class="w-lg m-auto " name="Compute" callback={fit_function} subprocess={true} />
</div>

<style>
    .plot__div {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(700px, 1fr));
        margin-top: 1rem;
    }
</style>
