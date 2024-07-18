<script lang="ts">
    import { model, current_model, values_stored, model_name, model_description, default_param_values } from './stores';
    import supervised_ml_models from '$lib/config/supervised_ml_models.yml';
    import { CustomSelect } from '$lib/components';
    import { ArrowDown, ArrowUp, CircleX, Save, Upload } from 'lucide-svelte/icons';
    import ModelParameters from './ModelParameters.svelte';
    import Notification from '$lib/components/Notification.svelte';

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

    const save_parameters = async () => {
        // Save the parameters to the backend

        const saveloc = await dialog.save({
            title: 'Save parameters',
            filters: [{ name: 'JSON', extensions: ['json'] }],
            defaultPath: `./${$model}.json`,
        });
        if (!saveloc) return;

        // if (await fs.exists(saveloc)) {
        //     const overwrite = await dialog.confirm(
        //         'File already exists. Do you want to overwrite it?',
        //         'Overwrite file',
        //     );
        //     if (!overwrite) return;
        // }

        const save_content = JSON.stringify($values_stored[$model], null, 4);
        await fs.writeTextFile(saveloc, save_content);

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

        let uploadloc: string;
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

        const contents = await fs.readTextFile(uploadloc);
        try {
            const parsed = JSON.parse(contents);
            $values_stored[$model] = parsed;
            toast.success('Parameters uploaded successfully');
        } catch (e) {
            toast.error('Error: Invalid JSON file');
        }
    };
</script>

<div {id} style:display class="grid content-start gap-2">
    <CustomSelect
        label="Supervised Learning Algorithms"
        bind:value={$model}
        items={Object.keys(supervised_ml_models)}
        on:change={set_model_params}
    />

    {#if $current_model && $values_stored[$model]}
        <div class="grid gap-1">
            <h2 class="flex justify-center">{$model_name}</h2>
            <span class="text-sm">{$model_description}</span>
            <hr />
        </div>

        <div class="flex">
            <h3>Hyperparameters and Parameters</h3>
            <div class="ml-auto">
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
