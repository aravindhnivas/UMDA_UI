<script lang="ts">
    export let data: any = {};
</script>

<div class="grid grid-cols-3 max-w-4xl">
    {#if data?.descriptive_statistics && data?.skewness && data?.kurtosis && data?.anderson_darling_test}
        <div class="grid gap-1" style="align-content: baseline;">
            <h3>Descriptive Statistics</h3>
            <p>Mean: {data.descriptive_statistics.mean.toFixed(4)}</p>
            <p>Median: {data.descriptive_statistics['50%'].toFixed(4)}</p>
            <p>Standard Deviation: {data.descriptive_statistics.std.toFixed(4)}</p>
            <p>Minimum: {data.descriptive_statistics.min.toFixed(4)}</p>
            <p>Maximum: {data.descriptive_statistics.max.toFixed(4)}</p>
        </div>
        <div class="grid gap-1" style="align-content: baseline;">
            <h3>Distribution Characteristics</h3>
            <p>Skewness: {data.skewness.toFixed(4)}</p>
            <p>Kurtosis: {data.kurtosis.toFixed(4)}</p>
        </div>
        <div class="grid gap-1" style="align-content: baseline;">
            <h3>Anderson-Darling Test</h3>
            <p>Statistic: {data.anderson_darling_test.statistic.toFixed(4)}</p>
            <p>Critical Values:</p>
            <ul>
                {#each data.anderson_darling_test.critical_values as cv, index (cv)}
                    <li>
                        {data.anderson_darling_test.significance_levels?.[index]}% significance level: {cv.toFixed(4)}
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>
