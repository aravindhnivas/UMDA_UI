<script lang="ts">
    import {
        current_model,
        default_param_values,
        fine_tune_model,
        fine_tuned_hyperparameters,
        model,
        default_parameter_mode,
    } from './stores';
    import { validateInput } from '$lib/utils';
    import { Checkbox, CustomSelect } from '$lib/components';
    import Kernel from './Kernel.svelte';
    import Notification from '$lib/components/Notification.svelte';

    export let values: Record<string, any>;
    export let key: 'hyperparameters' | 'parameters';

    const unique_id = getContext<string>('unique_id');
    $: fine_tune_mode = $fine_tune_model && key === 'hyperparameters';
</script>

{#if !$default_parameter_mode}
    <div class="flex flex-col gap-4 hyperparameters__div px-2">
        {#each Object.keys($current_model[key]) as label (label)}
            {@const { value, description } = $current_model[key][label]}

            {#if $model === 'gpr' && label === 'kernel'}
                <Kernel bind:value={values[label]} />
            {:else if label in values}
                {#if typeof value === 'boolean'}
                    <div class="grid gap-1">
                        {#if fine_tune_mode}
                            <input
                                class="input input-sm"
                                bind:value={$fine_tuned_hyperparameters[$model][label]}
                                autocomplete="false"
                            />
                        {:else}
                            <Checkbox class="p-2 w-max" bind:value={values[label]} {label} />
                        {/if}
                        <span class="text-xs">
                            {description}
                            <div class="badge badge-sm badge-neutral">Default: {$default_param_values[key][label]}</div>
                        </span>
                    </div>
                {:else if typeof value === 'string' || typeof value === 'number'}
                    <div class="grid gap-1">
                        <div class="grid">
                            <div class="text-xs">{label}</div>
                            {#if fine_tune_mode}
                                <input
                                    class="input input-sm"
                                    bind:value={$fine_tuned_hyperparameters[$model][label]}
                                    autocomplete="false"
                                />
                            {:else}
                                <input class="w-max input input-sm" bind:value={values[label]} autocomplete="false" />
                            {/if}
                        </div>
                        <span class="text-xs"
                            >{description}
                            <div class="badge badge-sm badge-neutral">Default: {$default_param_values[key][label]}</div>
                        </span>
                    </div>
                {:else if typeof value === 'object' && value}
                    <div class="grid gap-1">
                        <div class="flex items-end gap-4">
                            {#if fine_tune_mode}
                                <div class="grid w-full">
                                    <div class="text-xs">{label}</div>
                                    <input
                                        class=" input input-sm"
                                        bind:value={$fine_tuned_hyperparameters[$model][label]}
                                        autocomplete="false"
                                    />
                                </div>
                            {:else}
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
                            {/if}
                        </div>
                        <span class="text-xs pl-1"
                            >{description}
                            <div class="badge badge-sm badge-neutral">Default: {$default_param_values[key][label]}</div>
                        </span>
                    </div>
                {:else if value == null}
                    <div class="grid gap-1">
                        <span class="text-xs">{label}</span>
                        {#if fine_tune_mode}
                            <input
                                class="input input-sm"
                                bind:value={$fine_tuned_hyperparameters[$model][label]}
                                autocomplete="false"
                            />
                        {:else}
                            <input class="w-max input input-sm" bind:value={values[label]} autocomplete="false" />
                        {/if}
                        <span class="text-xs">{description}. Default: None</span>
                    </div>
                {/if}
            {:else}
                <span class="text-sm">{label} not defined in object</span>
            {/if}
        {/each}
    </div>
{:else}
    <div class="p-2">
        <Notification message="Default mode" type="warning" />
    </div>
{/if}

<style>
    .hyperparameters__div {
        max-height: calc(100vh - 20rem);
        overflow: auto;
    }
</style>
