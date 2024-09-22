<script lang="ts">
    import Plot from 'svelte-plotly.js';
    import { typeSafeObjectKeys } from '$lib/utils';
    export let plots_data: YDistributionPlotData;

    const histogramLayout: Partial<Plotly.Layout> = {
        title: 'Histogram',
        xaxis: { title: 'Value' },
        yaxis: { title: 'Frequency' },
    };

    const boxPlotLayout: Partial<Plotly.Layout> = {
        title: 'Box Plot',
        yaxis: { title: 'Value' },
    };

    const qqPlotLayout: Partial<Plotly.Layout> = {
        title: 'Q-Q Plot',
        xaxis: { title: 'Theoretical Quantiles' },
        yaxis: { title: 'Sample Quantiles' },
    };

    const kdePlotLayout: Partial<Plotly.Layout> = {
        title: 'Kernel Density Estimation',
        xaxis: { title: 'Value' },
        yaxis: { title: 'Density' },
    };

    const layouts: Record<YDistributionPlotNames, Partial<Plotly.Layout>> = {
        histogram: histogramLayout,
        box_plot: boxPlotLayout,
        qq_plot: qqPlotLayout,
        kde: kdePlotLayout,
    };

    const plot_descriptions: Record<YDistributionPlotNames, { name: string; description: string }> = {
        histogram: {
            name: 'Histogram',
            description:
                'This histogram shows the frequency distribution of the dataset values. It helps visualize the overall shape of the data distribution, including any skewness or multiple peaks.',
        },
        kde: {
            name: 'Kernel Density Estimation',
            description:
                'This plot shows a smooth, continuous estimation of the probability density function of the dataset. It provides a more refined view of the data distribution compared to the histogram, helping to identify features like skewness and multiple modes.',
        },
        box_plot: {
            name: 'Box Plot',
            description:
                "The box plot displays the five-number summary (minimum, first quartile, median, third quartile, maximum) of the dataset. It's useful for identifying the central tendency, spread, and potential outliers in the data.",
        },
        qq_plot: {
            name: 'Q-Q Plot',
            description:
                'The Q-Q (Quantile-Quantile) plot compares the distribution of the dataset to a theoretical normal distribution. A straight line indicates that the data follows a normal distribution, while deviations suggest non-normality.',
        },
    };

    let show_plot = true;
</script>

<div class="flex">
    <button class="btn btn-sm btn-outline" on:click={() => (show_plot = !show_plot)}
        >{show_plot ? 'Hide' : 'Show'} plot</button
    >
</div>

{#if show_plot}
    {#each typeSafeObjectKeys(plots_data) as key}
        {@const data = plots_data[key]}
        {@const layout = layouts[key]}
        {@const plot_description = plot_descriptions[key]}
        <div style="height: 500px; ">
            <Plot {data} {layout} fillParent={true} debounce={250} />
        </div>
        <div class="text-sm font-400">
            <span class="font-bold">{plot_description.name}: </span>{plot_description.description}
        </div>
        <hr />
    {/each}
{/if}
