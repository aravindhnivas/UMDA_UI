<script lang="ts">
    import { Checkbox, CustomInput, CustomSelect } from '$lib/components';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import Paper, { Content, Subtitle } from '@smui/paper';
    import { Ban, TriangleAlert } from 'lucide-svelte/icons';
    import {
        analyse_shapley_values,
        available_scalers,
        available_transformations,
        backends,
        bootstrap,
        bootstrap_nsamples,
        cross_validation,
        cv_fold,
        fine_tune_model,
        grid_search_method,
        halving_factor,
        inverse_scaling,
        inverse_transform,
        learning_curve,
        n_jobs,
        noise_percentage,
        optuna_n_trials,
        optuna_n_warmup_steps,
        optuna_resume_study,
        parallel_computation,
        parallel_computation_backend,
        randomzied_gridsearch_niter,
        skip_invalid_y_values,
        test_size,
        yscaling,
        ytransformation,
    } from './stores';

    const grid_search_methods = [
        'Optuna',
        'GridSearchCV',
        'RandomizedSearchCV',
        'HalvingGridSearchCV',
        'HalvingRandomSearchCV',
        // 'DaskGridSearchCV',
        // 'DaskRandomizedSearchCV',
    ];
    const elevation = 3;
    const paper_style = 'background-color: transparent;';
</script>

<CustomPanel open={true}>
    <svelte:fragment slot="title" let:open>
        <div class="flex-center">
            <span>Control Panel</span>
            {#if !open}
                <div class="join">
                    <span class="join-item badge badge-warning">{100 - $test_size}</span>
                    <span class="join-item badge badge-info">{$test_size}</span>
                </div>
                {#if $ytransformation !== 'None'}
                    <span class="badge">{$ytransformation}</span>
                {/if}
                {#if $yscaling !== 'None'}
                    <span class="badge">{$yscaling}</span>
                {/if}
                {#if $bootstrap}
                    <span class="badge badge-warning">Augment</span>
                {/if}

                {#if $fine_tune_model}
                    <span class="badge badge-primary">Fine-tune</span>
                {/if}
                {#if $cross_validation}
                    <span class="badge">Cross-validation</span>
                {/if}
                {#if $parallel_computation}
                    <span class="badge badge-primary">Parallel</span>
                {/if}
                {#if $skip_invalid_y_values}
                    <span class="badge badge-warning">skip_invalid_y_values</span>
                {/if}
                {#if $learning_curve.active}
                    <span class="badge badge-warning">learning_curve</span>
                {/if}
            {/if}
        </div>
    </svelte:fragment>

    <div class="grid grid-cols-2 gap-2">
        <Paper transition {elevation} style={paper_style}>
            <Subtitle>Data split-ratio, transformation and scaling</Subtitle>
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
                            disabled={$fine_tune_model}
                        />
                        {#if $ytransformation !== 'None'}
                            <Checkbox
                                bind:value={$inverse_transform}
                                label="apply inverse_transform"
                                check="checkbox"
                                disabled={$fine_tune_model}
                            />
                        {/if}
                    </div>
                    <div class="grid">
                        <CustomSelect
                            items={available_scalers}
                            label="y-scaling"
                            bind:value={$yscaling}
                            disabled={$fine_tune_model}
                        />
                        {#if $yscaling !== 'None'}
                            <Checkbox
                                bind:value={$inverse_scaling}
                                label="apply inverse_scaling"
                                check="checkbox"
                                disabled={$fine_tune_model}
                            />
                        {/if}
                    </div>

                    <span class="col-span-2 flex gap-1 badge-sm badge-warning rounded-sm">
                        <TriangleAlert size="15" />
                        Always inverse the transformations and scaling applied to your target variable before calculating
                        metrics.
                    </span>
                    {#if $fine_tune_model}
                        <span class="col-span-2 flex gap-1 badge-sm badge-error rounded-sm">
                            <Ban size="15" />
                            y-transformation and y-scaling for grid-search methods is not yet supported.
                        </span>
                    {/if}
                </div>
            </Content>
        </Paper>
        <Paper transition {elevation} style={paper_style}>
            <Subtitle>Fine tuning parameters and Cross-validation metrics</Subtitle>
            <Content class="grid grid-cols-2 gap-1 items-start">
                <Checkbox bind:value={$fine_tune_model} label="Grid search" check="checkbox" />
                <Checkbox bind:value={$cross_validation} label="Cross validation" check="checkbox" />
                <CustomSelect
                    label="Choose grid search method"
                    items={grid_search_methods}
                    bind:value={$grid_search_method}
                    disabled={!$fine_tune_model}
                    helperHighlight={$fine_tune_model ? 'Recommended: Optuna' : ''}
                />
                <CustomInput
                    label="cv_fold"
                    bind:value={$cv_fold}
                    min="2"
                    type="number"
                    disabled={!($cross_validation || $fine_tune_model)}
                />

                {#if $grid_search_method === 'Optuna'}
                    <CustomInput
                        label="n_trials (Optuna)"
                        bind:value={$optuna_n_trials}
                        min="2"
                        type="number"
                        disabled={!$fine_tune_model || $grid_search_method !== 'Optuna'}
                    />
                    <CustomInput
                        label="n_warmup_steps (Optuna)"
                        helper="Number of steps before pruning the trials"
                        bind:value={$optuna_n_warmup_steps}
                        min="2"
                        max={$optuna_n_trials}
                        type="number"
                        disabled={!$fine_tune_model || $grid_search_method !== 'Optuna'}
                    />
                    <Checkbox bind:value={$optuna_resume_study.resume} label="resume_optuna_study" check="checkbox" />
                    <CustomInput
                        label="resume_id"
                        bind:value={$optuna_resume_study.id}
                        disabled={!$optuna_resume_study.resume}
                    />
                {:else}
                    <CustomInput
                        label="n_iter"
                        bind:value={$randomzied_gridsearch_niter}
                        min="2"
                        type="number"
                        disabled={!$fine_tune_model ||
                            $grid_search_method === 'Optuna' ||
                            !$grid_search_method.includes('RandomizedSearchCV')}
                    />

                    <CustomInput
                        label="Halving factor"
                        bind:value={$halving_factor}
                        min="2"
                        type="number"
                        disabled={!$fine_tune_model ||
                            $grid_search_method === 'Optuna' ||
                            !$grid_search_method.includes('Halving')}
                    />
                {/if}
            </Content>
        </Paper>
        <Paper transition {elevation} style={paper_style}>
            <Subtitle>Augment data-size</Subtitle>
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
            <Subtitle>Parallel processing</Subtitle>
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
            </Content>
        </Paper>
        <Paper transition {elevation} style={paper_style}>
            <Subtitle>Learning curve</Subtitle>
            <Content>
                <p class="prose text-sm">Predicting scalability of training data size</p>
                <Checkbox bind:value={$learning_curve.active} label="Learning curve" check="checkbox" />
                <CustomInput
                    label="min, max, length - Relative train sizes"
                    helper="Train sizes for learning curve analysis"
                    bind:value={$learning_curve.train_sizes}
                    disabled={!$learning_curve.active}
                />
            </Content>
        </Paper>
        <Paper transition {elevation} style={paper_style}>
            <Subtitle>Misc</Subtitle>
            <Content>
                <div class="flex gap-2">
                    <Checkbox bind:value={$skip_invalid_y_values} label="skip_invalid_y_values" check="checkbox" />
                    <Checkbox bind:value={$analyse_shapley_values} label="analyse_shapley_values" check="checkbox" />
                </div>
            </Content>
        </Paper>
    </div>
</CustomPanel>
