<script lang="ts">
    import { current_model, default_param_values } from './stores';
    import Textfield from '@smui/textfield';
    import { validateInput } from '$lib/utils';
    import { Checkbox, CustomSelect } from '$lib/components';

    export let values: Record<string, any>;
    export let key: 'hyperparameters' | 'parameters';
    const unique_id = getContext<string>('unique_id');
</script>

<div class="flex flex-col gap-4 hyperparameters__div">
    {#each Object.keys($current_model[key]) as label (label)}
        {@const { value, description } = $current_model[key][label]}
        {#if typeof value === 'boolean'}
            <div class="grid gap-1">
                <Checkbox class="p-2 w-max" bind:value={values[label]} {label} />
                <span class="text-xs">
                    {description}
                    <div class="badge badge-sm badge-neutral">Default: {$default_param_values[key][label]}</div>
                </span>
            </div>
        {:else if typeof value === 'string' || typeof value === 'number'}
            <div class="grid gap-1">
                <div class="grid">
                    <div class="text-xs">{label}</div>
                    <input class="w-max input input-sm" bind:value={values[label]} autocomplete="false" />
                </div>
                <span class="text-xs"
                    >{description}
                    <div class="badge badge-sm badge-neutral">Default: {$default_param_values[key][label]}</div>
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
                    <div class="badge badge-sm badge-neutral">Default: {$default_param_values[key][label]}</div>
                </span>
            </div>
        {:else if value == null}
            <div class="grid">
                <span class="text-xs">{label}</span>
                <input class="w-max input input-sm" bind:value={values[label]} autocomplete="false" />
                <span class="text-xs">{description}. Default: None</span>
            </div>
        {/if}
    {/each}
</div>

<style>
    .hyperparameters__div {
        max-height: calc(100vh - 20rem);
        overflow: auto;
    }
</style>
