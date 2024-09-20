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
    import { LockKeyhole, UnlockKeyhole } from 'lucide-svelte/icons';
    import CustomInput from '$lib/components/CustomInput.svelte';

    export let values: Record<string, any>;
    export let key: 'hyperparameters' | 'parameters';

    const unique_id = getContext<string>('unique_id');
    $: fine_tune_mode = $fine_tune_model && key === 'hyperparameters';

    // $: console.warn('all_params_lock_status', $all_params_lock_status[$model][key]);
    // $: console.warn($model);
    $: if ($model && isEmpty($all_params_lock_status[$model]?.[key])) {
        const param_keys = typeSafeObjectKeys($current_model[key]);
        param_keys.forEach(label => {
            $all_params_lock_status[$model][key][label] ??= true;
        });
        console.warn('all_params_lock_status', $all_params_lock_status[$model][key]);
    }
</script>

{#if !$default_parameter_mode}
    <div class="flex flex-col gap-4 hyperparameters__div px-2">
        {#each typeSafeObjectKeys($current_model[key]) as label (label)}
            {@const { value, description } = $current_model[key][label]}

            {#if $model === 'gpr' && label === 'kernel'}
                <Kernel bind:value={values[label]} />
            {:else if label in values}
                {#if typeof value === 'boolean'}
                    <div class="flex items-center gap-1">
                        <button
                            on:click={() => {
                                $all_params_lock_status[$model][key][label] =
                                    !$all_params_lock_status[$model][key][label];
                            }}
                        >
                            {#if $all_params_lock_status[$model][key][label]}
                                <LockKeyhole />
                            {:else}
                                <UnlockKeyhole />
                            {/if}
                        </button>
                        {#if fine_tune_mode}
                            <CustomInput
                                {label}
                                helper={`${description}. Default: ${$default_param_values[key][label]}`}
                                bind:value={$fine_tuned_hyperparameters[$model][label]}
                                disabled={$all_params_lock_status[$model][key][label]}
                            />
                        {:else}
                            <div class="grid">
                                <Checkbox
                                    class="p-2 w-max"
                                    bind:value={values[label]}
                                    {label}
                                    disabled={$all_params_lock_status[$model][key][label]}
                                />
                                <span class="text-xs">
                                    {description}
                                    <div class="badge badge-sm badge-neutral">
                                        Default: {$default_param_values[key][label]}
                                    </div>
                                </span>
                            </div>
                        {/if}
                    </div>
                {:else if typeof value === 'string' || typeof value === 'number'}
                    <div class="flex items-center gap-1">
                        <button
                            on:click={() => {
                                $all_params_lock_status[$model][key][label] =
                                    !$all_params_lock_status[$model][key][label];
                            }}
                        >
                            {#if $all_params_lock_status[$model][key][label]}
                                <LockKeyhole />
                            {:else}
                                <UnlockKeyhole />
                            {/if}
                        </button>
                        {#if fine_tune_mode}
                            <CustomInput
                                {label}
                                helper={`${description}. Default: ${$default_param_values[key][label]}`}
                                bind:value={$fine_tuned_hyperparameters[$model][label]}
                                disabled={$all_params_lock_status[$model][key][label]}
                            />
                        {:else}
                            <CustomInput
                                {label}
                                helper={`${description} Default: ${$default_param_values[key][label]}`}
                                bind:value={values[label]}
                                disabled={$all_params_lock_status[$model][key][label]}
                            />
                        {/if}
                    </div>
                {:else if typeof value === 'object' && value}
                    <div class="flex items-center gap-1">
                        <button
                            on:click={() => {
                                $all_params_lock_status[$model][key][label] =
                                    !$all_params_lock_status[$model][key][label];
                            }}
                        >
                            {#if $all_params_lock_status[$model][key][label]}
                                <LockKeyhole />
                            {:else}
                                <UnlockKeyhole />
                            {/if}
                        </button>
                        {#if fine_tune_mode}
                            <CustomInput
                                {label}
                                helper={`${description}. Default: ${$default_param_values[key][label]}`}
                                bind:value={$fine_tuned_hyperparameters[$model][label]}
                                disabled={$all_params_lock_status[$model][key][label]}
                            />
                        {:else}
                            <CustomSelect
                                label={`${label} (${value.options[values[label]]})`}
                                helper={`${description}. Default: ${$default_param_values[key][label]}`}
                                items={typeSafeObjectKeys(value.options)}
                                bind:value={values[label]}
                                disabled={$all_params_lock_status[$model][key][label]}
                            />
                            {#if values[label] === 'float'}
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
                    <div class="flex items-center gap-1">
                        <button
                            on:click={() => {
                                $all_params_lock_status[$model][key][label] =
                                    !$all_params_lock_status[$model][key][label];
                            }}
                        >
                            {#if $all_params_lock_status[$model][key][label]}
                                <LockKeyhole />
                            {:else}
                                <UnlockKeyhole />
                            {/if}
                        </button>
                        {#if fine_tune_mode}
                            <CustomInput
                                {label}
                                helper={`${description}. Default: None`}
                                bind:value={$fine_tuned_hyperparameters[$model][label]}
                                disabled={$all_params_lock_status[$model][key][label]}
                            />
                        {:else}
                            <CustomInput
                                {label}
                                bind:value={values[label]}
                                disabled={$all_params_lock_status[$model][key][label]}
                                helper={`${description}. Default: None`}
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
