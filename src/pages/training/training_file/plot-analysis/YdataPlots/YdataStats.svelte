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
            <p>Mean: {data.descriptive_statistics.mean.toFixed(4)}</p>
            <p>Median: {data.descriptive_statistics['50%'].toFixed(4)}</p>
            <p>Standard Deviation: {data.descriptive_statistics.std.toFixed(4)}</p>
            <p>Minimum: {data.descriptive_statistics.min.toFixed(4)}</p>
            <p>Maximum: {data.descriptive_statistics.max.toFixed(4)}</p>
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
            <p>Critical Values</p>
            <ul>
                {#each data.anderson_darling_test.critical_values as cv, index (cv)}
                    <li>
                        {data.anderson_darling_test.significance_levels?.[index]}% significance level: {cv.toFixed(4)}
                    </li>
                {/each}
            </ul>
            <p class="text-sm">
                Critical Values: These are thresholds for different significance levels. If the test statistic is
                greater than a critical value, it suggests the data is not normally distributed at that significance
                level.
            </p>
        </div>
    {/if}
</div>
<hr />
