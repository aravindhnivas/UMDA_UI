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
    import Kernel from './Kernel.svelte';
    import Notification from '$lib/components/Notification.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { LockKeyhole, UnlockKeyhole, TriangleAlert, Search, XOctagon } from 'lucide-svelte/icons';
    import TuneInput from '$lib/components/TuneInput.svelte';

    export let values: Record<string, any>;
    export let key: 'hyperparameters' | 'parameters';

    const unique_id = getContext<string>('unique_id');

    $: if (isEmpty($all_params_lock_status[$model]?.[key])) {
        const param_keys = Object.keys($current_model[key]);
        param_keys.forEach(label => {
            $all_params_lock_status[$model][key][label] ??= true;
        });
    }

    const ncols = 3;
    let include_fields: Record<MLModel, string[]> = {} as Record<MLModel, string[]>;

    $: if ($model && !include_fields[$model]) {
        include_fields[$model] = Object.keys($current_model[key]);
    }
    let search_key: Record<MLModel, string> = {} as Record<MLModel, string>;
    $: if ($model && !search_key[$model]) {
        search_key[$model] = '';
    }

    const search_update = (field: string) => {
        if (!field) {
            include_fields[$model] = Object.keys($current_model[key]);
            return;
        }
        include_fields[$model] = Object.keys($current_model[key]).filter(f =>
            f.toLowerCase().includes(field.toLowerCase()),
        );
    };

    $: search_update(search_key[$model]);
</script>

<div class="grid m-2">
    <span class="badge m-auto w-full flex gap-2">
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
                    {unlocked_len} / {total_len} parameters are unlocked
                </span>
            {/if}
        </div>
    {/if}

    {#if $fine_tune_model}
        <span class="badge badge-info m-auto w-full">Grid search mode turned ON</span>
        <span class="badge badge-info m-auto w-full font-bold">
            Please unlock the parameters to fine-tune i.e., enter comma separated values
        </span>
        {#if !Object.values($fine_tuned_values[$model][key]).some(f => f.active)}
            <span class="badge badge-error m-auto w-full flex gap-2">
                <TriangleAlert size="20" />
                <span>Grid search mode turned ON. Fine-tune the parameters to use the grid search</span>
            </span>
        {/if}
    {:else if Object.values($fine_tuned_values[$model][key]).some(f => f.active)}
        <span class="badge badge-error m-auto w-full flex gap-2">
            <TriangleAlert size="20" />
            <span>Turn on grid search mode to use the fine-tuned search parameters in the model</span>
        </span>
    {/if}
</div>

{#if !$default_parameter_mode}
    <div class="grid gap-2">
        <CustomInput label="Search {key}" bind:value={search_key[$model]}>
            <svelte:fragment slot="pre-input-within">
                <Search size="20" />
            </svelte:fragment>
            <svelte:fragment slot="post-input-within">
                <button on:click={() => (search_key[$model] = '')}>
                    <XOctagon size="20" color="red" />
                </button>
            </svelte:fragment>
        </CustomInput>
        <div class="grid gap-4 grid-cols-{ncols} hyperparameters__div py-5 px-2">
            {#each Object.keys($current_model[key]) as label (label)}
                {#if include_fields[$model].includes(label)}
                    {@const { value, description } = $current_model[key][label]}
                    {#if $model === 'gpr' && label === 'kernel'}
                        <div class="grid gap-2 col-span-{ncols}">
                            <Kernel bind:value={values[label]} />
                        </div>
                    {:else if label in values}
                        {#if typeof value === 'object' && value}
                            <TuneInput
                                label={`${label} (${value.options[values[label]]})`}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                items={Object.keys(value.options)}
                                bind:value={values[label]}
                                bind:lock={$all_params_lock_status[$model][key][label]}
                                bind:fine_tune={$fine_tuned_values[$model][key][label].active}
                                bind:fine_tuned_values={$fine_tuned_values[$model][key][label].value}
                                bind:scale={$fine_tuned_values[$model][key][label].scale}
                                bind:type={$fine_tuned_values[$model][key][label].type}
                            >
                                {#if values[label] === 'float'}
                                    <CustomInput
                                        class="col-span-6"
                                        id="{unique_id}_{label}"
                                        label={`Enter ${label}`}
                                        value=""
                                        helper={description}
                                        helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                        bind:lock={$all_params_lock_status[$model][key][label]}
                                        on:keydown={validateInput}
                                    />
                                {/if}
                            </TuneInput>
                        {:else}
                            <TuneInput
                                {label}
                                helper={description}
                                helperHighlight={`Default: ${$default_param_values[key][label]}`}
                                bind:value={values[label]}
                                bind:lock={$all_params_lock_status[$model][key][label]}
                                bind:fine_tune={$fine_tuned_values[$model][key][label].active}
                                bind:fine_tuned_values={$fine_tuned_values[$model][key][label].value}
                                bind:scale={$fine_tuned_values[$model][key][label].scale}
                                bind:type={$fine_tuned_values[$model][key][label].type}
                            />
                        {/if}
                    {:else}
                        <span class="text-sm bg-red">{label} not defined in object</span>
                    {/if}
                {/if}
            {/each}
        </div>
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
