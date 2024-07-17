<script lang="ts">
    import Textfield from '@smui/textfield';
    import { validateInput } from '$lib/utils';
    import { Checkbox, CustomSelect } from '$lib/components';

    export let parameters: Record<string, any>;
    export let values: Record<string, any>;
    export let unique_id: string;
</script>

<div class="flex flex-col gap-4 hyperparameters__div">
    {#each Object.keys(parameters) as label (label)}
        {@const { value, description } = parameters[label]}
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
                                id="{unique_id}_{label}"
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

<style>
    .hyperparameters__div {
        max-height: calc(100vh - 20rem);
        overflow: auto;
    }
</style>
