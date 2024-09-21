<script lang="ts">
    import { active_tab, sizeDistributionFilter } from './stores';
    import BaseLayout from './BaseLayout.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import Plot from 'svelte-plotly.js';

    const name = 'size_distribution';

    let min_atomic_number: number | null = null;
    let max_atomic_number: number | null = null;
    let count_threshold: number | null = null;

    const layout: Partial<Plotly.Layout> = {
        xaxis: { title: 'No. of atoms' },
        yaxis: { title: 'Count', type: 'log' },
    };
    let plotData: Partial<Plotly.PlotData>[] = [];

    let plotted = false;
    const GetData = getContext<(name: string) => Promise<{ x: number[]; y: number[] }>>('GetData');

    const plot_data = async () => {
        const { x, y } = await GetData(`${name}.csv`);

        min_atomic_number = x[0];
        max_atomic_number = x?.at(-1) ?? 0;
        count_threshold = y.at(-1) ?? 0;
        plotData = [{ x, y }];
        plotted = true;
    };

    $: if (!$sizeDistributionFilter.min_atomic_number.lock && min_atomic_number !== null)
        $sizeDistributionFilter.min_atomic_number.value = min_atomic_number;
    $: if (!$sizeDistributionFilter.max_atomic_number.lock && max_atomic_number !== null)
        $sizeDistributionFilter.max_atomic_number.value = max_atomic_number;
    $: if (!$sizeDistributionFilter.count_threshold.lock && count_threshold !== null)
        $sizeDistributionFilter.count_threshold.value = count_threshold;
</script>

<BaseLayout {name} hidden={$active_tab !== name} on:plot={plot_data}>
    {#if plotted && min_atomic_number !== null && max_atomic_number !== null && count_threshold !== null}
        <h3>Filtering</h3>
        <div class="flex gap-3 items-end">
            <CustomInput
                bind:value={min_atomic_number}
                label="Min"
                enabled_lock_mode
                bind:lock={$sizeDistributionFilter.min_atomic_number.lock}
            />
            <CustomInput
                bind:value={max_atomic_number}
                label="Max"
                enabled_lock_mode
                bind:lock={$sizeDistributionFilter.max_atomic_number.lock}
            />
            <CustomInput
                bind:value={count_threshold}
                label="count threshold"
                enabled_lock_mode
                bind:lock={$sizeDistributionFilter.count_threshold.lock}
            />
        </div>
    {/if}
    <div style="height: 500px;">
        <Plot data={plotData} {layout} fillParent={true} debounce={250} />
    </div>
</BaseLayout>
