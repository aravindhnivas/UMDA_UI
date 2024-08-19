<script lang="ts">
    import { active_tab, post_analysis_files_directory } from './stores';
    import BaseLayout from './BaseLayout.svelte';
    import Chip, { Set, Text } from '@smui/chips';
    import Plot from 'svelte-plotly.js';
    import { parse_csv_file } from '$lib/utils/index';

    const name = 'structural_distribution';

    let plotted = false;
    let choices: string[] = [];
    let selected: string[] = [];

    let plotData: Partial<Plotly.PieData>[] = [];

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

        plotData = [
            {
                labels: x,
                values: y,
                type: 'pie',
                textinfo: 'label+percent',
                textposition: 'outside',
                automargin: true,
                // insidetextorientation: 'radial',
            },
        ];
        plotted = true;
    };
</script>

<BaseLayout {name} hidden={$active_tab !== name} on:plot={on_plot}>
    {#if plotted}
        <h3>Filtering</h3>
        <Set chips={choices} let:chip filter bind:selected>
            <Chip {chip} touch>
                <Text>{chip}</Text>
            </Chip>
        </Set>
        <pre class="status">Selected: {selected.length} categories</pre>
    {/if}
    <div class="h-lg min-w-xl">
        <Plot data={plotData} fillParent={true} debounce={250} />
    </div>
</BaseLayout>
