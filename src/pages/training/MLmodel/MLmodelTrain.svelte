<script lang="ts">
    import { CustomSelect } from '$lib/components';
    import supervised_ml_models from '$lib/config/supervised_ml_models.yml';
    import { ArrowDown, ArrowUp } from 'lucide-svelte';
    import ModelParameters from './ModelParameters.svelte';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    const unique_id = Math.random().toString(36).substring(2, 15);
    const model = localWritable('ml_model', '');

    let hyperparameters_values = {} as Record<string, any>;
    let parameters_values = {} as Record<string, any>;

    let current_model = null as null | {
        name: string;
        description: string;
        hyperparameters: Record<string, any>;
        parameters: Record<string, any>;
        optimize_for_CV: string[];
    };

    const set_model = () => {
        if (!$model) return;

        current_model = supervised_ml_models[$model];
        if (!current_model) return;

        hyperparameters_values = {};
        parameters_values = {};

        Object.keys(current_model['hyperparameters']).forEach(label => {
            if (!current_model) return;
            const { value } = current_model['hyperparameters'][label];

            if (typeof value === 'object' && value) {
                hyperparameters_values[label] = value.default;
            } else {
                hyperparameters_values[label] = value;
            }
        });

        Object.keys(current_model['parameters']).forEach(label => {
            if (!current_model) return;
            const { value } = current_model['parameters'][label];

            if (typeof value === 'object' && value) {
                parameters_values[label] = value.default;
            } else {
                parameters_values[label] = value;
            }
        });
    };

    onMount(() => {
        set_model();
    });

    const fit_function = () => {
        const values = { ...hyperparameters_values, ...parameters_values };
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

    {#if current_model}
        <div class="grid gap-1">
            <h2 class="flex justify-center">{current_model['name']}</h2>
            <span class="text-sm">{current_model['description']}</span>
            <hr />
        </div>

        <h3>Hyperparameters and Parameters</h3>
        <ModelParameters
            parameters={current_model['hyperparameters']}
            bind:values={hyperparameters_values}
            {unique_id}
        />

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
            <ModelParameters parameters={current_model['parameters']} bind:values={parameters_values} {unique_id} />
        {/if}

        <button class="btn btn-sm w-max m-auto" on:click={fit_function}>Submit</button>
    {/if}
</div>
