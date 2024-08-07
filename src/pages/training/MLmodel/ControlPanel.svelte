<script lang="ts">
    import {
        fine_tune_model,
        logYscale,
        cv_fold,
        bootstrap_nsamples,
        noise_percentage,
        scaleYdata,
        cross_validation,
        bootstrap,
        test_size,
        grid_search_method,
        randomzied_gridsearch_niter,
        halving_factor,
        parallel_computation,
        n_jobs,
        parallel_computation_backend,
        backends,
    } from './stores';
    import { Checkbox, CustomSelect, CustomInput } from '$lib/components';
    import CustomPanel from '$lib/components/CustomPanel.svelte';

    const grid_search_methods = [
        'GridSearchCV',
        'RandomizedSearchCV',
        'HalvingGridSearchCV',
        'HalvingRandomSearchCV',
        'DaskGridSearchCV',
        'DaskRandomSearchCV',
    ];
</script>

<CustomPanel title="Control" open={true}>
    <div class="flex flex-wrap gap-4">
        <div class="grid gap-1">
            <input class="range" type="range" min="5" max="95" step="5" bind:value={$test_size} />
            <span>split: {$test_size}% test : {100 - $test_size}% train</span>
            {#if $test_size > 50}
                <div class="badge badge-sm badge-warning">Warning: Test split ratio is greater than 50%</div>
            {/if}
            <div class="flex gap-1">
                <Checkbox bind:value={$logYscale} label="log-yscale" check="checkbox" />
                <Checkbox bind:value={$scaleYdata} label="scale-ydata" check="checkbox" />
            </div>
        </div>
        <div class="grid grid-cols-2 gap-1 items-end">
            <Checkbox bind:value={$fine_tune_model} label="Grid search" check="checkbox" />
            <Checkbox bind:value={$cross_validation} label="Cross validation" check="checkbox" />
            <CustomSelect items={grid_search_methods} bind:value={$grid_search_method} disabled={!$fine_tune_model} />
            <CustomInput
                bind:value={$cv_fold}
                min="2"
                type="number"
                disabled={!($cross_validation || $fine_tune_model)}
            />
            <CustomInput
                label="n_iter"
                bind:value={$randomzied_gridsearch_niter}
                min="2"
                type="number"
                disabled={!$fine_tune_model}
            />
            <CustomInput
                label="Halving factor"
                bind:value={$halving_factor}
                min="2"
                type="number"
                disabled={!$fine_tune_model}
            />
        </div>
        <div class="grid gap-1">
            <Checkbox bind:value={$bootstrap} label="bootstrap" check="checkbox" />
            <div class="flex gap-2">
                <CustomInput
                    label="n_samples"
                    bind:value={$bootstrap_nsamples}
                    type="number"
                    step="1"
                    disabled={!$bootstrap}
                />

                <CustomInput
                    label="noise (%)"
                    bind:value={$noise_percentage}
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    disabled={!$bootstrap}
                />
            </div>
        </div>
        <div class="grid gap-1">
            <Checkbox bind:value={$parallel_computation} label="Parallel computation" check="checkbox" />
            <div class="flex gap-2 items-end">
                <CustomInput
                    label="n_jobs"
                    bind:value={$n_jobs}
                    type="number"
                    step="1"
                    disabled={!$parallel_computation}
                />
                <CustomSelect
                    label="backend"
                    items={backends}
                    bind:value={$parallel_computation_backend}
                    disabled={!$parallel_computation}
                />
            </div>
        </div>
    </div>
</CustomPanel>
