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
    } from './stores';
    import { Checkbox, CustomSelect } from '$lib/components';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import Textfield from '@smui/textfield';

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
    <div class="flex gap-2 justify-between">
        <div class="grid gap-1">
            <input class="range w-xs" type="range" min="5" max="95" step="5" bind:value={$test_size} />
            <span>split: {$test_size}% test : {100 - $test_size}% train</span>
            {#if $test_size > 50}
                <div class="badge badge-sm badge-warning">Warning: Test split ratio is greater than 50%</div>
            {/if}
        </div>

        <div class="flex gap-2 items-center flex-wrap justify-items-end">
            <div class="flex flex-wrap gap-2">
                <CustomSelect label="Grid search method" items={grid_search_methods} bind:value={$grid_search_method} />
                {#if $cross_validation || $fine_tune_model}
                    <Textfield bind:value={$cv_fold} input$min="2" label="CV (N-fold)" type="number" />
                {/if}

                <div class="grid gap-2">
                    <Checkbox bind:value={$logYscale} label="log-yscale" check="checkbox" />
                    <Checkbox bind:value={$scaleYdata} label="scale-ydata" check="checkbox" />
                </div>
                <div class="grid gap-2">
                    <Checkbox bind:value={$fine_tune_model} label="fine-tune hyperparameters" check="checkbox" />
                    <Checkbox bind:value={$cross_validation} label="Cross-validation" check="checkbox" />
                </div>
            </div>

            <div class="grid">
                <Checkbox bind:value={$bootstrap} label="bootstrap" check="checkbox" />
                {#if $bootstrap}
                    <div class="flex gap-2">
                        <Textfield bind:value={$bootstrap_nsamples} label="Number of samples" type="number" />
                        <Textfield
                            bind:value={$noise_percentage}
                            label="noise (%)"
                            type="number"
                            input$step="0.1"
                            input$min="0"
                            input$max="100"
                        />
                    </div>
                {/if}
            </div>
        </div>
    </div>
</CustomPanel>
