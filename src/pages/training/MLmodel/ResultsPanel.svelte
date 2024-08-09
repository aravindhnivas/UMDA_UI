<script lang="ts">
    import { plot_data, results } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import Plot from 'svelte-plotly.js';
</script>

<CustomPanel open={true}>
    <svelte:fragment slot="title">
        <div class="flex-center">
            <span>Results</span>
            {#if $results}
                <span class="badge badge-info">
                    {$results?.time ? `completed in ${$results?.time}` : ''}
                </span>
            {/if}
        </div>
    </svelte:fragment>

    <div class="grid gap-2">
        {#if $results}
            <div class="flex gap-2 items-center">
                <span class="badge">R<sup>2</sup>: {$results.r2}</span>
                {#if $results?.cross_validation && $results?.cv_scores}
                    <span class="badge"
                        >{$results?.cv_fold}-fold CV - R<sup>2</sup>: {$results.cv_scores.mean} ({$results.cv_scores
                            .std})</span
                    >
                {/if}
                <span class="badge">MSE: {$results.mse}</span>
                <span class="badge">RMSE: {$results.rmse}</span>
                <span class="badge">MAE: {$results.mae}</span>
            </div>
            <span class="badge badge-info"># data: {$results?.data_size}</span>

            {#if $results?.best_params}
                <hr />
                <div class="grid gap-2">
                    <h3>Best parameters</h3>
                    <span class="text-sm">Best score: {$results.best_score}</span>
                    <div class="flex gap-2 flex-wrap">
                        {#each Object.entries($results.best_params) as [key, value]}
                            <span class="badge badge-info">{key}: {value}</span>
                        {/each}
                    </div>
                </div>
                <hr />
            {/if}

            <div class="plot h-lg min-w-xl">
                <Plot
                    data={$plot_data}
                    layout={{
                        xaxis: { title: 'y_true' },
                        yaxis: { title: 'y_pred' },
                        margin: { t: 0 },
                    }}
                    fillParent={true}
                    debounce={250}
                />
            </div>
        {/if}
    </div>
</CustomPanel>
