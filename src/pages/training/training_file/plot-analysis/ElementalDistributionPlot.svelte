<script lang="ts">
    import { active_tab, post_analysis_files_directory } from './stores';
    import BaseLayout from './BaseLayout.svelte';
    import Chip, { Set, Text } from '@smui/chips';
    import { CustomInput } from '$lib/components';
    import Plot from 'svelte-plotly.js';
    import { parse_csv_file } from '$lib/utils/index';

    const name = 'elemental_distribution';

    let plotted = false;
    let choices: string[] = [];
    let selected: string[] = [];
    let select_all = true;

    const layout: Partial<Plotly.Layout> = {
        xaxis: { title: 'Element' },
        yaxis: { title: 'Count', type: 'log' },
        margin: { t: 0 },
    };
    let plotData: Partial<Plotly.PlotData>[] = [];

    const on_plot = async () => {
        const csv_file = await path.join(await $post_analysis_files_directory, `${name}.csv`);
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

        choices = x;
        await tick();
        selected = [...choices];
        select_all = true;

        count_threshold = y.at(-1) ?? 0;
        plotData = [{ x, y, type: 'bar' }];
        plotted = true;
    };

    let count_threshold: number = 0;
    let filter_locked = {
        count_threshold: true,
    };
</script>

<BaseLayout {name} hidden={$active_tab !== name} on:plot={on_plot}>
    <!-- {#if plotted} -->
    <h3>Filtering</h3>
    <div class="flex gap-2 items-end justify-between">
        <button
            class="btn btn-sm w-max"
            on:click={() => {
                selected = select_all ? [] : [...choices];
                select_all = !select_all;
            }}>Select {select_all ? 'none' : 'all'}</button
        >
        <CustomInput
            bind:value={count_threshold}
            label="count threshold"
            enabled_lock_mode
            bind:lock={filter_locked.count_threshold}
        />
    </div>
    <Set chips={choices} let:chip filter bind:selected>
        <Chip {chip} touch>
            <Text>{chip}</Text>
        </Chip>
    </Set>
    <pre class="status">Selected: {selected.length} elements</pre>
    <div class="h-lg min-w-xl">
        <Plot data={plotData} {layout} fillParent={true} debounce={250} />
    </div>
</BaseLayout>
