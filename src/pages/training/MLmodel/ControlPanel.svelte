<script lang="ts">
    import {
        fine_tune_model,
        cv_fold,
        bootstrap_nsamples,
        noise_percentage,
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
        skip_invalid_y_values,
        available_transformations,
        available_scalers,
        ytransformation,
        yscaling,
        inverse_scaling,
        inverse_transform,
    } from './stores';
    import { Checkbox, CustomSelect, CustomInput } from '$lib/components';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import Paper, { Title, Content } from '@smui/paper';

    const grid_search_methods = [
        'GridSearchCV',
        'RandomizedSearchCV',
        'HalvingGridSearchCV',
        'HalvingRandomSearchCV',
        'DaskGridSearchCV',
        'DaskRandomSearchCV',
    ];
    const elevation = 3;
    const paper_style = 'background-color: whitesmoke;';
</script>

<CustomPanel open={true}>
    <svelte:fragment slot="title" let:open>
        <div class="flex-center">
            <span>Control Panel</span>
            {#if !open}
                <div class="join">
                    <span class="join-item badge-sm badge-warning">{100 - $test_size}</span>
                    <span class="join-item badge-sm badge-info">{$test_size}</span>
                </div>
                {#if $ytransformation !== 'None'}
                    <span class="badge-sm badge-info">{$ytransformation}</span>
                {/if}
                {#if $yscaling !== 'None'}
                    <span class="badge-sm badge-info">{$yscaling}</span>
                {/if}
                {#if $bootstrap}
                    <span class="badge-sm badge-warning">Augment</span>
                {/if}

                {#if $fine_tune_model}
                    <span class="badge-sm badge-info">Fine-tune</span>
                {/if}
                {#if $cross_validation}
                    <span class="badge-sm badge-info">Cross-validation</span>
                {/if}
                {#if $parallel_computation}
                    <span class="badge-sm badge-primary">Parallel</span>
                {/if}
                {#if $skip_invalid_y_values}
                    <span class="badge-sm badge-warning">skip_invalid_y_values</span>
                {/if}
            {/if}
        </div>
    </svelte:fragment>

    <div class="grid grid-cols-2 gap-2">
        <Paper transition {elevation} style={paper_style}>
            <Title>Data split-ratio, transformation and scaling</Title>
            <Content class="grid gap-2">
                <input class="range" type="range" min="0" max="100" step="5" bind:value={$test_size} />
                <span class="text-sm font-400">Split ratios: {$test_size}% test : {100 - $test_size}% train</span>
                {#if $test_size > 50}
                    <div class="badge badge-sm badge-warning">Warning: Test split ratio is greater than 50%</div>
                {/if}
                <div class="grid grid-cols-2 gap-1">
                    <div class="grid">
                        <CustomSelect
                            items={available_transformations}
                            label="y-transformation"
                            bind:value={$ytransformation}
                        />
                        {#if $ytransformation !== 'None'}
                            <Checkbox
                                bind:value={$inverse_transform}
                                label="apply inverse_transform"
                                check="checkbox"
                            />
                        {/if}
                    </div>
                    <div class="grid">
                        <CustomSelect items={available_scalers} label="y-scaling" bind:value={$yscaling} />
                        {#if $yscaling !== 'None'}
                            <Checkbox bind:value={$inverse_scaling} label="apply inverse_scaling" check="checkbox" />
                        {/if}
                    </div>

                    <!-- {#if !$inverse_scaling || !$inverse_transform} -->
                    <span class="badge-sm badge-info col-span-2">
                        Always inverse the transformations and scaling applied to your target variable before
                        calculating metrics.
                    </span>
                    <!-- {/if} -->
                </div>
            </Content>
        </Paper>
        <Paper transition {elevation} style={paper_style}>
            <Title>Fine tuning parameters and Cross-validation metrics</Title>
            <Content class="grid grid-cols-2 gap-1">
                <Checkbox bind:value={$fine_tune_model} label="Grid search" check="checkbox" />
                <Checkbox bind:value={$cross_validation} label="Cross validation" check="checkbox" />
                <CustomSelect
                    items={grid_search_methods}
                    bind:value={$grid_search_method}
                    disabled={!$fine_tune_model}
                />
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
            </Content>
        </Paper>
        <Paper transition {elevation} style={paper_style}>
            <Title>Augment data-size</Title>
            <Content>
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
            </Content>
        </Paper>
        <Paper transition {elevation} style={paper_style}>
            <Title>Parallel processing</Title>
            <Content>
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
                <Checkbox bind:value={$skip_invalid_y_values} label="skip_invalid_y_values" check="checkbox" />
            </Content>
        </Paper>
    </div>
</CustomPanel>
