<script lang="ts">
    import { Checkbox, CustomSelect } from '$lib/components';
    import supervised_ml_models from '$lib/config/supervised_ml_models.yml';
    import Textfield from '@smui/textfield';
    import { validateInput } from '$lib/utils';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    const unique_id = Math.random().toString(36).substring(2, 15);
    const model = localWritable('ml_model', '');

    let values = {} as Record<string, any>;

    let current_model = null as null | {
        name: string;
        description: string;
        hyperparameters: Record<string, any>;
    };

    const set_model = () => {
        if (!$model) return;

        current_model = supervised_ml_models[$model];
        if (!current_model) return;

        values = {};

        Object.keys(current_model['hyperparameters']).forEach(label => {
            if (!current_model) return;
            const { value } = current_model['hyperparameters'][label];

            if (typeof value === 'object' && value) {
                values[label] = value.default;
            } else {
                values[label] = value;
            }
        });
    };

    onMount(() => {
        set_model();
    });

    const fit_function = () => {
        const clonedValues = structuredClone(values);
        Object.entries(values).forEach(([key, value]) => {
            if (value === 'float') {
                const input = document.getElementById(`${unique_id}_${id}_${key}`) as HTMLInputElement;

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
        console.log({ values, clonedValues });
    };
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

        <div id="hyperparameters__div" class="flex flex-col gap-4">
            {#each Object.keys(current_model['hyperparameters']) as label (label)}
                {@const { value, description } = current_model['hyperparameters'][label]}
                {#if typeof value === 'boolean'}
                    <div class="grid gap-1">
                        <Checkbox class="p-2 w-max" bind:value={values[label]} {label} />
                        <span class="text-xs">{description}</span>
                    </div>
                {:else if typeof value === 'string' || typeof value === 'number'}
                    <div class="grid gap-1">
                        <Textfield class="w-max" bind:value={values[label]} {label} autocomplete="false" />
                        <span class="text-xs">{description}</span>
                    </div>
                {:else if typeof value === 'object' && value}
                    <div class="grid w-max">
                        <div class="flex items-end gap-4">
                            <CustomSelect
                                label={`${label} (${value.options[values[label]]})`}
                                items={Object.keys(value.options)}
                                bind:value={values[label]}
                            />
                            {#if values[label] === 'float'}
                                <div class="grid">
                                    <span class="text-xs pl-1">Enter {label} value</span>
                                    <!-- svelte-ignore a11y-autocomplete-valid -->
                                    <input
                                        autocomplete="false"
                                        on:keydown={validateInput}
                                        id="{unique_id}_{id}_{label}"
                                        class="input input-sm"
                                        type="number"
                                    />
                                </div>
                            {/if}
                        </div>
                        <span class="text-xs pl-1">{description}</span>
                    </div>
                {:else if value == null}
                    <div class="grid">
                        <Textfield class="w-max" bind:value={values[label]} {label} autocomplete="false" />
                        <span class="text-xs">{description}. Default: None</span>
                    </div>
                {/if}
            {/each}
        </div>

        <button class="btn btn-sm w-max m-auto" on:click={fit_function}>Submit</button>
    {/if}
</div>

<style>
    #hyperparameters__div {
        max-height: calc(100vh - 20rem);
        overflow: auto;
    }
</style>
