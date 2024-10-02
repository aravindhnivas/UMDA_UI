<script lang="ts">
    import Stats from './Stats.svelte';
    import ResultsPlots from './ResultsPlots.svelte';
    import { model, results, test_size } from '../stores';

    export let significant_digits: number;
</script>

<div class="grid gap-2">
    {#if $results?.[$model]}
        {@const r = $results[$model]}
        <div class="flex gap-1">
            <span class="badge badge-primary">
                {r.time ? `completed in ${r.time}` : ''}
            </span>
            <span class="badge badge-primary">Dataset size: {r.data_shapes.y}</span>
        </div>

        <div class="grid grid-cols-6 gap-2 items-center w-3xl">
            <span class="col-span-2"></span>
            <span class="badge">R<sup>2</sup></span>
            <span class="badge">MSE</span>
            <span class="badge">RMSE</span>
            <span class="badge">MAE</span>
        </div>

        <Stats stats={r.train_stats} rcv={r.cv_scores?.train} cv_fold={r.cv_fold} {significant_digits}>
            Train stats ({100 - $test_size}% data = {r.data_shapes.y_train})
        </Stats>
        <Stats bg_color="info" stats={r.test_stats} rcv={r.cv_scores?.test} cv_fold={r.cv_fold} {significant_digits}>
            Test stats ({$test_size}% data = {r.data_shapes.y_test})
        </Stats>

        {#if r.best_params}
            <hr />
            <div class="grid gap-2">
                <h3>Best parameters</h3>
                <div class="flex gap-2 flex-wrap">
                    {#each Object.entries(r.best_params) as [key, value]}
                        <span class="badge badge-info">{key}: {value}</span>
                    {/each}
                </div>
            </div>
            <hr />
        {/if}
    {/if}

    <ResultsPlots />
</div>
