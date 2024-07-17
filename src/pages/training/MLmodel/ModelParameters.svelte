<script lang="ts">
    import { model } from './stores';
    import Textfield from '@smui/textfield';
    import { validateInput } from '$lib/utils';
    import { Checkbox, CustomSelect } from '$lib/components';
    import supervised_ml_models from '$lib/config/supervised_ml_models.yml';

    export let parameters: Record<string, any>;
    export let values: Record<string, any>;
    // export let model: string;

    const unique_id = getContext<string>('unique_id');

    // let origial_values = {} as Record<string, any>;

    const get_values_from_model = (model: string) => {
        if (!model) return;

        const original_model = supervised_ml_models[model];
        if (!original_model) return;

        let hyperparameters_values = {} as Record<string, any>;
        let parameters_values = {} as Record<string, any>;

        Object.keys(original_model['hyperparameters']).forEach(label => {
            if (!original_model) return;
            const { value } = original_model['hyperparameters'][label];

            if (typeof value === 'object' && value) {
                hyperparameters_values[label] = value.default;
            } else {
                hyperparameters_values[label] = value;
            }
        });

        Object.keys(original_model['parameters']).forEach(label => {
            if (!original_model) return;
            const { value } = original_model['parameters'][label];

            if (typeof value === 'object' && value) {
                parameters_values[label] = value.default;
            } else {
                parameters_values[label] = value;
            }
        });

        const all_values = { ...hyperparameters_values, ...parameters_values };
        return all_values;
    };

    $: origial_values = get_values_from_model($model);
</script>

{#if origial_values}
    <div class="flex flex-col gap-4 hyperparameters__div">
        {#each Object.keys(parameters) as label (label)}
            {@const { value, description } = parameters[label]}
            {#if typeof value === 'boolean'}
                <div class="grid gap-1">
                    <Checkbox class="p-2 w-max" bind:value={values[label]} {label} />
                    <span class="text-xs">
                        {description}
                        <div class="badge badge-sm badge-neutral">Default: {origial_values[label]}</div>
                    </span>
                </div>
            {:else if typeof value === 'string' || typeof value === 'number'}
                <div class="grid gap-1">
                    <Textfield class="w-max" bind:value={values[label]} {label} autocomplete="false" />
                    <span class="text-xs"
                        >{description}
                        <div class="badge badge-sm badge-neutral">Default: {origial_values[label]}</div>
                    </span>
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
                                    id="{unique_id}_{label}"
                                    class="input input-sm"
                                    type="number"
                                />
                            </div>
                        {/if}
                    </div>
                    <span class="text-xs pl-1"
                        >{description}
                        <div class="badge badge-sm badge-neutral">Default: {origial_values[label]}</div>
                    </span>
                </div>
            {:else if value == null}
                <div class="grid">
                    <Textfield class="w-max" bind:value={values[label]} {label} autocomplete="false" />
                    <span class="text-xs">{description}. Default: None</span>
                </div>
            {/if}
        {/each}
    </div>
{/if}

<style>
    .hyperparameters__div {
        max-height: calc(100vh - 20rem);
        overflow: auto;
    }
</style>
