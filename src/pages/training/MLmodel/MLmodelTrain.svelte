<script lang="ts">
    import { model, values_stored, model_name, model_description, original_model_parameters } from './stores';
    import supervised_ml_models from '$lib/config/supervised_ml_models.yml';
    import { CustomSelect } from '$lib/components';
    import { ArrowDown, ArrowUp } from 'lucide-svelte';
    import ModelParameters from './ModelParameters.svelte';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    const unique_id = Math.random().toString(36).substring(2, 15);
    setContext('unique_id', unique_id);

    let current_model = null as null | {
        name: string;
        description: string;
        hyperparameters: Record<string, any>;
        parameters: Record<string, any>;
    };

    const set_model = () => {
        if (!$model) return;

        current_model = supervised_ml_models[$model];
        if (!current_model) return;

        if (!$values_stored[$model]) {
            $values_stored[$model] = {
                hyperparameters: structuredClone($original_model_parameters.hyperparameters),
                parameters: structuredClone($original_model_parameters.parameters),
            };
        }
    };

    onMount(() => {
        set_model();
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
</script>

<div {id} style:display class="grid content-start gap-2">
    <CustomSelect
        label="Supervised Learning Algorithms"
        bind:value={$model}
        items={Object.keys(supervised_ml_models)}
        on:change={set_model}
    />

    {#if $model && current_model && $values_stored[$model]}
        <div class="grid gap-1">
            <h2 class="flex justify-center">{$model_name}</h2>
            <span class="text-sm">{$model_description}</span>
            <hr />
        </div>

        <h3>Hyperparameters and Parameters</h3>
        <ModelParameters key="hyperparameters" bind:values={$values_stored[$model].hyperparameters} />

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
            <ModelParameters key="parameters" bind:values={$values_stored[$model].parameters} />
        {/if}

        <button class="btn btn-sm w-max m-auto" on:click={fit_function}>Submit</button>
    {/if}
</div>
