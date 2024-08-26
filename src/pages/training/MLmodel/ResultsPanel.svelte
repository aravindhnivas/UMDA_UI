<script lang="ts">
    import { plot_data, results, model_names, model } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import Plot from 'svelte-plotly.js';

    $: console.log($plot_data);
</script>

<CustomPanel open={true}>
    <svelte:fragment slot="title">
        <div class="flex-center">
            <span>Results</span>
            {#if $results[$model]}
                {@const time = $results[$model]?.time}
                <span class="badge badge-info">
                    {time ? `completed in ${time}` : ''}
                </span>
            {/if}
        </div>
    </svelte:fragment>

    <div class="grid gap-2">
        {#if $results[$model]}
            {@const r = $results[$model]}
            <div class="flex gap-2 items-center">
                <span class="badge">R<sup>2</sup>: {r.r2}</span>
                {#if r?.cross_validation && r?.cv_scores}
                    <span class="badge"
                        >{r?.cv_fold}-fold CV - R<sup>2</sup>: {r.cv_scores.mean} ({r.cv_scores.std})</span
                    >
                {/if}
                <span class="badge">MSE: {r.mse}</span>
                <span class="badge">RMSE: {r.rmse}</span>
                <span class="badge">MAE: {r.mae}</span>
            </div>
            <span class="badge badge-info"># data: {r?.data_size}</span>

            {#if r?.best_params}
                <hr />
                <div class="grid gap-2">
                    <h3>Best parameters</h3>
                    <span class="text-sm">Best score: {r.best_score}</span>
                    <div class="flex gap-2 flex-wrap">
                        {#each Object.entries(r.best_params) as [key, value]}
                            <span class="badge badge-info">{key}: {value}</span>
                        {/each}
                    </div>
                </div>
                <hr />
            {/if}
        {/if}

        {#each model_names as model_name (model_name)}
            <div class="h-lg min-w-xl" class:hidden={model_name !== $model}>
                {#if $plot_data[model_name]}
                    <Plot
                        data={$plot_data[model_name]}
                        layout={{
                            title: model_name,
                            xaxis: { title: 'y_true' },
                            yaxis: { title: 'y_pred' },
                            // margin: { t: 0 },
                        }}
                        fillParent={true}
                        debounce={250}
                    />
                {/if}
            </div>
        {/each}
    </div>
</CustomPanel>
