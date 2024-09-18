<script lang="ts">
    import Plot from 'svelte-plotly.js';

    export let plots_data_and_layout: any = {};

    const plot_descriptions = [
        'This histogram shows the frequency distribution of the molecular property values. It helps visualize the overall shape of the data distribution, including any skewness or multiple peaks.',
        "The box plot displays the five-number summary (minimum, first quartile, median, third quartile, maximum) of the molecular property. It's useful for identifying the central tendency, spread, and potential outliers in the data.",
        'The Q-Q (Quantile-Quantile) plot compares the distribution of the molecular property to a theoretical normal distribution. A straight line indicates that the data follows a normal distribution, while deviations suggest non-normality.',
        'This plot shows a smooth, continuous estimation of the probability density function of the molecular property. It provides a more refined view of the data distribution compared to the histogram, helping to identify features like skewness and multiple modes.',
    ];
</script>

{#each plots_data_and_layout as { data, layout }, ind}
    <div class="h-lg min-w-xl">
        <Plot {data} {layout} fillParent={true} debounce={250} />
    </div>
    <div class="text-sm font-400">{plot_descriptions[ind]}</div>
    <hr />
{/each}
