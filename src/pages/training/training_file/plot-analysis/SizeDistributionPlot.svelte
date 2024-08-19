<script lang="ts">
    import { active_tab } from './stores';
    import BaseLayout from './BaseLayout.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import Plot from 'svelte-plotly.js';

    const name = 'size_distribution';

    let min_atomic_number: string = '1';
    let max_atomic_number: string;
    let count_threshold: number;

    const layout: Partial<Plotly.Layout> = {
        xaxis: { title: 'No. of atoms' },
        yaxis: { title: 'Count', type: 'log' },
        margin: {
            // l: 50,
            // r: 50,
            // b: 100,
            // t: 100,
            pad: 4,
        },
    };
    let plotData: Partial<Plotly.PlotData>[] = [];

    let plotted = false;
    const GetData = getContext<(name: string) => Promise<{ x: string[]; y: number[] }>>('GetData');

    const plot_data = async () => {
        const { x, y } = await GetData(`${name}.csv`);

        min_atomic_number = x[0];
        max_atomic_number = x?.at(-1) ?? '';
        count_threshold = y.at(-1) ?? 0;
        plotData = [{ x, y }];
        plotted = true;
    };

    let filter_locked = {
        min_atomic_number: true,
        max_atomic_number: true,
        count_threshold: true,
    };
</script>

<BaseLayout {name} hidden={$active_tab !== name} on:plot={plot_data}>
    {#if plotted}
        <h3>Filtering</h3>
        <div class="flex gap-3 items-end">
            <CustomInput
                bind:value={min_atomic_number}
                label="Min"
                enabled_lock_mode
                bind:lock={filter_locked.min_atomic_number}
            />
            <CustomInput
                bind:value={max_atomic_number}
                label="Max"
                enabled_lock_mode
                bind:lock={filter_locked.max_atomic_number}
            />
            <CustomInput
                bind:value={count_threshold}
                label="count threshold"
                enabled_lock_mode
                bind:lock={filter_locked.count_threshold}
            />
        </div>
    {/if}
    <div class="h-lg min-w-xl">
        <Plot data={plotData} {layout} fillParent={true} debounce={250} />
    </div>
</BaseLayout>
