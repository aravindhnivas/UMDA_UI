<script lang="ts">
    import { active_tab } from './stores';
    import BaseLayout from './BaseLayout.svelte';
    import Chip, { Set, Text } from '@smui/chips';
    import { CustomInput } from '$lib/components';
    import Plot from 'svelte-plotly.js';

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
    const GetData = getContext<(name: string) => Promise<{ x: string[]; y: number[] }>>('GetData');

    const plot_data = async () => {
        const { x, y } = await GetData(`${name}.csv`);

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

<BaseLayout {name} hidden={$active_tab !== name} on:plot={plot_data}>
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
