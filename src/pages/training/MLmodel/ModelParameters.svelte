<script lang="ts">
    import {
        current_model,
        default_param_values,
        fine_tune_model,
        fine_tuned_hyperparameters,
        model,
        default_parameter_mode,
        all_params_lock_status,
    } from './stores';
    import { typeSafeObjectKeys, validateInput } from '$lib/utils';
    import { Checkbox, CustomSelect } from '$lib/components';
    import Kernel from './Kernel.svelte';
    import Notification from '$lib/components/Notification.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { LockKeyhole, UnlockKeyhole } from 'lucide-svelte/icons';

    export let values: Record<string, any>;
    export let key: 'hyperparameters' | 'parameters';

    const unique_id = getContext<string>('unique_id');
    $: fine_tune_mode = $fine_tune_model && key === 'hyperparameters';

    $: if (isEmpty($all_params_lock_status[$model]?.[key])) {
        const param_keys = typeSafeObjectKeys($current_model[key]);
        param_keys.forEach(label => {
            $all_params_lock_status[$model][key][label] ??= true;
        });
        console.warn('all_params_lock_status', $all_params_lock_status[$model]?.[key]);
    }
</script>

{#if fine_tune_mode}
    <span class="badge badge-sm badge-primary my-2"
        >Grid search mode turned on. Please unlock the parameters to fine-tune</span
    >
{/if}

{#if !$default_parameter_mode}
    <div class="flex flex-col gap-4 hyperparameters__div p-2">
        {#each typeSafeObjectKeys($current_model[key]) as label (label)}
            {@const { value, description } = $current_model[key][label]}

            {#if $model === 'gpr' && label === 'kernel'}
                <Kernel bind:value={values[label]} />
            {:else if label in values}
                {#if typeof value === 'boolean'}
                    <div class="flex items-center gap-1">
                        {#if fine_tune_mode && !$all_params_lock_status[$model][key][label]}
                            <CustomInput
                                {label}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                bind:value={$fine_tuned_hyperparameters[$model][label]}
                                bind:lock={$all_params_lock_status[$model][key][label]}
                                enabled_lock_mode
                            />
                        {:else}
                            <button
                                on:click={() => {
                                    $all_params_lock_status[$model][key][label] =
                                        !$all_params_lock_status[$model][key][label];
                                }}
                            >
                                {#if $all_params_lock_status[$model][key][label]}
                                    <LockKeyhole color="gray" />
                                {:else}
                                    <UnlockKeyhole />
                                {/if}
                            </button>
                            <Checkbox
                                class="p-2 w-max"
                                bind:value={values[label]}
                                {label}
                                disabled={$all_params_lock_status[$model][key][label]}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                            />
                        {/if}
                    </div>
                {:else if typeof value === 'string' || typeof value === 'number'}
                    <div class="grid grid-cols-2">
                        {#if fine_tune_mode && !$all_params_lock_status[$model][key][label]}
                            <CustomInput
                                {label}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                bind:value={$fine_tuned_hyperparameters[$model][label]}
                                bind:lock={$all_params_lock_status[$model][key][label]}
                                enabled_lock_mode
                            />
                        {:else}
                            <CustomInput
                                {label}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                bind:value={values[label]}
                                bind:lock={$all_params_lock_status[$model][key][label]}
                                enabled_lock_mode
                            />
                        {/if}
                    </div>
                {:else if typeof value === 'object' && value}
                    <div class="grid grid-cols-2">
                        {#if fine_tune_mode && !$all_params_lock_status[$model][key][label]}
                            <CustomInput
                                {label}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                bind:value={$fine_tuned_hyperparameters[$model][label]}
                                bind:lock={$all_params_lock_status[$model][key][label]}
                                enabled_lock_mode
                            />
                        {:else}
                            <CustomSelect
                                label={`${label} (${value.options[values[label]]})`}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                items={typeSafeObjectKeys(value.options)}
                                bind:value={values[label]}
                                bind:lock={$all_params_lock_status[$model][key][label]}
                                enabled_lock_mode
                            />
                            {#if values[label] === 'float'}
                                <button
                                    on:click={() => {
                                        $all_params_lock_status[$model][key][label] =
                                            !$all_params_lock_status[$model][key][label];
                                    }}
                                >
                                    {#if $all_params_lock_status[$model][key][label]}
                                        <LockKeyhole color="gray" />
                                    {:else}
                                        <UnlockKeyhole />
                                    {/if}
                                </button>
                                <div class="grid">
                                    <span class="text-xs pl-1">Enter {label} value</span>
                                    <input
                                        autocomplete="off"
                                        autocapitalize="off"
                                        autocorrect="off"
                                        on:keydown={validateInput}
                                        id="{unique_id}_{label}"
                                        class="input input-sm"
                                        type="number"
                                        disabled={$all_params_lock_status[$model][key][label]}
                                    />
                                    <span class="text-xs pl-1"
                                        >{description}
                                        <div class="badge badge-sm badge-neutral">
                                            Default: {$default_param_values[key][label]}
                                        </div>
                                    </span>
                                </div>
                            {/if}
                        {/if}
                    </div>
                {:else if value == null}
                    <div class="grid grid-cols-2">
                        {#if fine_tune_mode && !$all_params_lock_status[$model][key][label]}
                            <CustomInput
                                {label}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                bind:value={$fine_tuned_hyperparameters[$model][label]}
                                bind:lock={$all_params_lock_status[$model][key][label]}
                                enabled_lock_mode
                            />
                        {:else}
                            <CustomInput
                                {label}
                                bind:value={values[label]}
                                disabled={$all_params_lock_status[$model][key][label]}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                bind:lock={$all_params_lock_status[$model][key][label]}
                                enabled_lock_mode
                            />
                        {/if}
                    </div>
                {/if}
            {:else}
                <span class="text-sm bg-red">{label} not defined in object</span>
            {/if}
        {/each}
    </div>
{:else}
    <div class="p-2">
        <Notification message="Default mode" type="info" dismissable={false} />
    </div>
{/if}

<style>
    .hyperparameters__div {
        max-height: calc(100vh - 20rem);
        overflow: auto;
    }
</style>
