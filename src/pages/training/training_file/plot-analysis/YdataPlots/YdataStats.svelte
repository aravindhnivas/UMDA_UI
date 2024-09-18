<script lang="ts">
    export let data: any = {};
</script>

<div class="grid grid-cols-3 max-w-6xl gap-[100px]">
    {#if data?.descriptive_statistics && data?.skewness && data?.kurtosis && data?.anderson_darling_test}
        <div class="grid gap-1" style="align-content: baseline;">
            <h3>Descriptive Statistics</h3>
            <p class="text-sm">
                These statistics provide a summary of the central tendency and dispersion of the molecular property data
            </p>
            <hr />

            <div class="grid grid-cols-2">
                <p>Mean</p>
                <span>{data.descriptive_statistics.mean.toFixed(4)}</span>
                <p>Median</p>
                <span>{data.descriptive_statistics['50%'].toFixed(4)}</span>
                <p>Standard Deviation</p>
                <span>{data.descriptive_statistics.std.toFixed(4)}</span>
                <p>Minimum</p>
                <span>{data.descriptive_statistics.min.toFixed(4)}</span>
                <p>Maximum</p>
                <span>{data.descriptive_statistics.max.toFixed(4)}</span>
            </div>
            <hr />
            <div class="grid grid-cols-2">
                <p>Percentile</p>
                <p>Critical Value</p>
                <p>25%</p>
                <span>{data.descriptive_statistics['25%'].toFixed(4)}</span>
                <p>50%</p>
                <span>{data.descriptive_statistics['50%'].toFixed(4)}</span>
                <p>75%</p>
                <span>{data.descriptive_statistics['75%'].toFixed(4)}</span>
            </div>
            <p class="text-sm">
                Percentiles are useful for understanding the spread and skewness of the data. The range between the 25th
                and 75th percentiles (interquartile range) contains the middle 50% of the data and is resistant to
                outliers.
            </p>
        </div>
        <div class="grid gap-1" style="align-content: baseline;">
            <h3>Distribution Characteristics</h3>
            <p class="text-sm">These metrics provide information about the shape of the data distribution</p>
            <hr />
            <p>Skewness: {data.skewness.toFixed(4)}</p>
            <p class="text-sm">
                Skewness: Measures the asymmetry of the distribution. A positive value indicates a right-skewed
                distribution, while a negative value indicates a left-skewed distribution.
            </p>
            <hr />
            <p>Kurtosis: {data.kurtosis.toFixed(4)}</p>

            <p class="text-sm">
                Kurtosis: Measures the "tailedness" of the distribution. A high value indicates heavy tails (more
                outliers), while a low value indicates light tails.
            </p>
        </div>
        <div class="grid gap-1" style="align-content: baseline;">
            <h3>Anderson-Darling Test</h3>
            <p class="text-sm">This test is used to determine if the data follows a normal distribution</p>
            <hr />
            <p>Statistic: {data.anderson_darling_test.statistic.toFixed(4)}</p>
            <p class="text-sm">
                Statistic: The test statistic. A smaller value suggests the data is closer to a normal distribution.
            </p>
            <hr />
            <div class="grid grid-cols-2 justify-items-start gap-1">
                <p>Significance Level</p>
                <p>Critical Value</p>
                {#each data.anderson_darling_test.critical_values as cv, index (cv)}
                    <p>{data.anderson_darling_test.significance_levels?.[index]}%</p>
                    <span>{cv.toFixed(4)}</span>
                {/each}
            </div>
            <p class="text-sm">
                Critical Values: These are thresholds for different significance levels. If the test statistic is
                greater than a critical value, it suggests the data is not normally distributed at that significance
                level.
            </p>
        </div>
    {/if}
</div>
<hr />
