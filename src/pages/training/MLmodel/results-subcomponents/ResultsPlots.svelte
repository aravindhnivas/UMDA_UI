<script lang="ts">
    import { current_training_data_file } from './../../training_file/plot-analysis/stores';
    import { plot_data, results, model } from '../stores';
    import Plot from 'svelte-plotly.js';

    const update_results = async (name: Promise<string>) => {
        await name;
        $plot_data = {} as any;
        $results = {} as any;
    };
    $: update_results($current_training_data_file);
</script>

<div style="height: 500px;">
    {#if $plot_data[$model] && $results[$model]}
        <Plot
            data={$plot_data[$model]}
            layout={{
                title: `${$model.toLocaleUpperCase()} Regressor`,
                xaxis: { title: 'y_true' },
                yaxis: { title: 'y_pred' },
            }}
            fillParent={true}
            debounce={250}
        />
    {/if}
</div>

{#if $results[$model]?.learning_curve_plotly_data}
    {@const plotlyData = $results[$model].learning_curve_plotly_data}
    {@const { data, layout } = plotlyData}
    <div style="height: 500px;">
        <Plot {data} {layout} fillParent={true} debounce={250} />
    </div>
{/if}
