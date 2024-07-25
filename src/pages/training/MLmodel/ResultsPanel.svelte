<script lang="ts">
    import { plot_data, results } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import Plot from 'svelte-plotly.js';
</script>

<CustomPanel title="Results">
    {#if $results}
        <div class="grid gap-2">
            <span>R2: {$results.r2}</span>
            <span>MSE: {$results.mse}</span>
            <span>RMSE: {$results.rmse}</span>
            <span>MAE: {$results.mae}</span>
        </div>

        {#if $results?.best_params}
            <hr />
            <div class="grid gap-2">
                <h3>Best parameters</h3>
                {#each Object.entries($results.best_params) as [key, value]}
                    <span>{key}: {value}</span>
                {/each}
                <span>Best score: {$results.best_score}</span>
            </div>
        {/if}

        <div class="plot__div">
            <div class="plot w-2xl h-lg">
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
        </div>
    {/if}
</CustomPanel>

<style>
    .plot__div {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(900px, 1fr));
        margin-top: 1rem;
    }
</style>
