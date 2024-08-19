<script lang="ts">
    import { active_tab, post_analysis_files_directory } from './stores';
    import BaseLayout from './BaseLayout.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import Plot from 'svelte-plotly.js';
    import { parse_csv_file } from '$lib/utils/index';

    const name = 'size_distribution';

    let min_atomic_number: string = '1';
    let max_atomic_number: string;
    let count_threshold: number;

    const layout: Partial<Plotly.Layout> = {
        xaxis: { title: 'No. of atoms' },
        yaxis: { title: 'Count', type: 'log' },
        margin: { t: 0 },
    };
    let plotData: Partial<Plotly.PlotData>[] = [];

    let plotted = false;

    const plot_data = async () => {
        // const csv_file = await path.join(await $post_analysis_files_directory, `${name}.csv`);
        const csv_file = await path.join(await $post_analysis_files_directory, `full_${name}.csv`);
        if (!(await fs.exists(csv_file))) {
            toast.error(`File ${csv_file} does not exist`);
            return;
        }

        const { columns, data } = await parse_csv_file(csv_file);

        const x = data.map(row => row[0]).filter(Boolean);
        const y = data
            .map(row => row[1])
            .filter(Boolean)
            .map(Number);

        min_atomic_number = x[0];
        max_atomic_number = x?.at(-1) ?? '';
        count_threshold = y.at(-1) ?? 0;

        // count_threshold = y.at(-1) ?? 0;
        // min_atomic_number = x[0]?.split('-')[0] ?? '1';
        // if (min_atomic_number == '0') min_atomic_number = '1';
        // max_atomic_number = x.at(-1)?.split('-')[1] ?? '';
        // plotData = [{ x, y, type: 'bar' }];
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
