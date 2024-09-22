<script lang="ts">
    import {
        current_model,
        default_param_values,
        fine_tune_model,
        fine_tuned_values,
        model,
        default_parameter_mode,
        all_params_lock_status,
    } from './stores';
    import { validateInput } from '$lib/utils';
    import { Checkbox, CustomSelect } from '$lib/components';
    import Kernel from './Kernel.svelte';
    import Notification from '$lib/components/Notification.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { LockKeyhole, UnlockKeyhole } from 'lucide-svelte/icons';

    export let values: Record<string, any>;
    export let key: 'hyperparameters' | 'parameters';

    const unique_id = getContext<string>('unique_id');
    // $: fine_tune_mode = $fine_tune_model && key === 'hyperparameters';

    $: if (isEmpty($all_params_lock_status[$model]?.[key])) {
        const param_keys = Object.keys($current_model[key]);
        param_keys.forEach(label => {
            $all_params_lock_status[$model][key][label] ??= true;
        });
        // console.warn('all_params_lock_status', $all_params_lock_status[$model]?.[key]);
    }

    const ncols = 3;
</script>

<div class="grid mb-2">
    <span class="badge badge-info m-auto w-full flex gap-2">
        Click <LockKeyhole size="16" /> to unlock <UnlockKeyhole size="16" /> parameters to change the value
    </span>

    {#if Object.values($all_params_lock_status[$model][key]) && !$default_parameter_mode}
        {@const locked_obj_values = Object.values($all_params_lock_status[$model][key])}
        {@const total_len = locked_obj_values.length}
        {@const locked_len = locked_obj_values.filter(f => f).length}
        {@const unlocked_len = total_len - locked_len}
        <div class="flex m-auto w-full">
            {#if unlocked_len === total_len}
                <span class="badge badge-success w-full">All {total_len} parameters are unlocked</span>
            {:else if unlocked_len === 0}
                <span class="badge badge-error w-full"> All {total_len} parameters are locked</span>
            {:else}
                <span class="badge badge-warning w-full">
                    {unlocked_len} / {locked_len} parameters are unlocked
                </span>
            {/if}
        </div>
    {/if}
    {#if $fine_tune_model}
        <span class="badge badge-warning m-auto w-full">Grid search mode turned ON</span>
        <span class="badge badge-warning m-auto w-full font-bold">
            Please unlock the parameters to fine-tune i.e., enter comma separated values
        </span>
    {/if}
</div>

{#if !$default_parameter_mode}
    <div class="grid gap-4 grid-cols-{ncols} hyperparameters__div p-2" style="">
        {#each Object.keys($current_model[key]) as label (label)}
            {@const { value, description } = $current_model[key][label]}
            {#if $model === 'gpr' && label === 'kernel'}
                <div class="grid gap-2 col-span-{ncols}">
                    <Kernel bind:value={values[label]} />
                </div>
            {:else if label in values}
                {#if typeof value === 'boolean'}
                    {#if $fine_tune_model && !$all_params_lock_status[$model][key][label]}
                        <CustomInput
                            {label}
                            helper={description}
                            helperHighlight={`Default: ${$default_param_values[key][label]}`}
                            bind:value={$fine_tuned_values[$model][key][label]}
                            bind:lock={$all_params_lock_status[$model][key][label]}
                            enabled_lock_mode
                        />
                    {:else}
                        <div class="flex gap-2 items-start">
                            <Checkbox
                                bind:value={values[label]}
                                {label}
                                disabled={$all_params_lock_status[$model][key][label]}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                bind:lock={$all_params_lock_status[$model][key][label]}
                                enabled_lock_mode
                            />
                        </div>
                    {/if}
                {:else if typeof value === 'string' || typeof value === 'number'}
                    {#if $fine_tune_model && !$all_params_lock_status[$model][key][label]}
                        <CustomInput
                            {label}
                            helper={description}
                            helperHighlight={`Default: ${$default_param_values[key][label]}`}
                            bind:value={$fine_tuned_values[$model][key][label]}
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
                {:else if typeof value === 'object' && value}
                    {#if $fine_tune_model && !$all_params_lock_status[$model][key][label]}
                        <CustomInput
                            {label}
                            helper={description}
                            helperHighlight={`Default: ${$default_param_values[key][label]}`}
                            bind:value={$fine_tuned_values[$model][key][label]}
                            bind:lock={$all_params_lock_status[$model][key][label]}
                            enabled_lock_mode
                        />
                    {:else}
                        <CustomSelect
                            label={`${label} (${value.options[values[label]]})`}
                            helper={description}
                            helperHighlight={`Default: ${$default_param_values[key][label]}`}
                            items={Object.keys(value.options)}
                            bind:value={values[label]}
                            bind:lock={$all_params_lock_status[$model][key][label]}
                            enabled_lock_mode
                        >
                            {#if values[label] === 'float'}
                                <CustomInput
                                    id="{unique_id}_{label}"
                                    label={`Enter ${label}`}
                                    value=""
                                    type="number"
                                    helper={description}
                                    helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                    bind:lock={$all_params_lock_status[$model][key][label]}
                                    enabled_lock_mode
                                    on:keydown={validateInput}
                                />
                            {/if}
                        </CustomSelect>
                    {/if}
                {:else if value == null}
                    {#if $fine_tune_model && !$all_params_lock_status[$model][key][label]}
                        <CustomInput
                            {label}
                            helper={description}
                            helperHighlight={`Default: ${$default_param_values[key][label]}`}
                            bind:value={$fine_tuned_values[$model][key][label]}
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
        align-items: baseline;
    }
</style>
