<script lang="ts">
    import { model, current_model, values_stored, default_param_values } from './stores';
    import supervised_ml_models from '$lib/config/supervised_ml_models.yml';
    import { CustomSelect } from '$lib/components';
    import { ArrowDown, ArrowUp, RotateCcw, Save, Upload } from 'lucide-svelte/icons';
    import ModelParameters from './ModelParameters.svelte';
    import Notification from '$lib/components/Notification.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    const unique_id = Math.random().toString(36).substring(2, 15);
    setContext('unique_id', unique_id);

    const set_model_params = () => {
        if (!$model) return;
        if (!$current_model) return;

        // Initialize the values_stored object if it doesn't exist
        $values_stored[$model] ??= {
            hyperparameters: structuredClone($default_param_values.hyperparameters),
            parameters: structuredClone($default_param_values.parameters),
        };

        // Set the default values if they don't exist
        $values_stored[$model].hyperparameters ??= structuredClone($default_param_values.hyperparameters);
        $values_stored[$model].parameters ??= structuredClone($default_param_values.parameters);

        console.log($values_stored[$model]);
    };

    onMount(() => {
        set_model_params();
    });

    const fit_function = () => {
        const values = { ...$values_stored[$model].hyperparameters, ...$values_stored[$model].parameters };
        const clonedValues = structuredClone(values);

        Object.entries(values).forEach(([key, value]) => {
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
            } else if (typeof value === 'string' && value.trim() === '') {
                clonedValues[key] = null;
            }
        });
        console.log(clonedValues);
    };

    let more_options = false;
    let savedfile: string;
    let uploadedfile: { fullname: string; name: string; model: string } | null = null;
    const save_parameters = async () => {
        // Save the parameters to the backend

        const saveloc = await dialog.save({
            title: 'Save parameters',
            filters: [{ name: 'JSON', extensions: ['json'] }],
            defaultPath: `./${$model}.json`,
        });
        if (!saveloc) return;
        savedfile = saveloc;
        // if (await fs.exists(saveloc)) {
        //     const overwrite = await dialog.confirm(
        //         'File already exists. Do you want to overwrite it?',
        //         'Overwrite file',
        //     );
        //     if (!overwrite) return;
        // }

        const save_content = JSON.stringify(
            {
                values: $values_stored[$model],
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
            $values_stored[$model] = parsed.values;
            toast.success('Parameters uploaded successfully');
        } catch (e) {
            toast.error('Error: Invalid JSON file');
        }
    };

    const reset_parameters = () => {
        $values_stored[$model] = {
            hyperparameters: structuredClone($default_param_values.hyperparameters),
            parameters: structuredClone($default_param_values.parameters),
        };
    };

    let toggle_browse_files = true;
    let train_X_file = '';
    let train_Y_file = '';
</script>

<div {id} style:display class="grid content-start gap-2">
    <h2>ML model training</h2>

    <div class="flex gap-2">
        <h3>Browse training files</h3>
        <label class="swap">
            <input type="checkbox" bind:checked={toggle_browse_files} />
            <div class="swap-on">Hide</div>
            <div class="swap-off">Show</div>
        </label>
    </div>

    {#if toggle_browse_files}
        <BrowseFile btn_name="Browse - X (.npy)" helper="embedded N dimension vectors" bind:filename={train_X_file} />
        <BrowseFile btn_name="Browse - Y" helper="single column 1-D file" bind:filename={train_Y_file} />
    {/if}

    <CustomSelect
        label="Supervised Learning Algorithms"
        bind:value={$model}
        items={Object.keys(supervised_ml_models)}
        on:change={set_model_params}
    />

    {#if $current_model && $values_stored[$model]}
        <div class="grid gap-1">
            <h2 class="flex justify-center">{$current_model.name}</h2>
            <span class="text-sm">{$current_model.description}</span>
            <hr />
        </div>

        <div class="flex">
            <h3>
                <span>Hyperparameters and Parameters</span>
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

        {#if $values_stored[$model]?.hyperparameters}
            <ModelParameters key="hyperparameters" bind:values={$values_stored[$model].hyperparameters} />
        {:else}
            <Notification message="No hyperparameters found" type="error" />
        {/if}

        <button
            class="btn btn-sm w-max ml-auto"
            on:click={() => {
                more_options = !more_options;
            }}
        >
            <span>More options</span>
            {#if more_options}
                <ArrowUp />
            {:else}
                <ArrowDown />
            {/if}
        </button>

        {#if more_options}
            <hr />
            {#if $values_stored[$model]?.parameters}
                <ModelParameters key="parameters" bind:values={$values_stored[$model].parameters} />
            {:else}
                <Notification message="No parameters found" type="error" />
            {/if}
        {/if}

        <button class="btn btn-sm w-max m-auto" on:click={fit_function}>Submit</button>
    {/if}
</div>
