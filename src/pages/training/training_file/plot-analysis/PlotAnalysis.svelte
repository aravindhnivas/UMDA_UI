<script lang="ts">
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import { post_analysis_files } from './stores';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import Plot from 'svelte-plotly.js';

    const tab_items = ['size_distribution', 'structural_distribution', 'elemental_distribution'] as const;
    let active_tab: (typeof tab_items)[number] = 'size_distribution';

    let plotData: {
        size_distribution: Partial<Plotly.PlotData>[];
        structural_distribution: Partial<Plotly.PieData>[];
        elemental_distribution: Partial<Plotly.PlotData>[];
    } = {
        size_distribution: [],
        structural_distribution: [],
        elemental_distribution: [],
    };

    const parse_csv_file = async (csv_file: string) => {
        const contents = await fs.readTextFile(csv_file);
        const lines = contents.split('\n');
        const columns = lines[0].split(',');
        const data = lines.slice(1).map(line => line.split(','));
        // .filter(line => line.length === columns.length);
        return { columns, data };
    };

    const layout: Record<(typeof tab_items)[number], Partial<Plotly.Layout>> = {
        size_distribution: {
            xaxis: { title: 'No. of atoms' },
            yaxis: { title: 'Count', type: 'log' },
            margin: { t: 0 },
        },
        structural_distribution: {},
        elemental_distribution: {
            xaxis: { title: 'Element' },
            yaxis: { title: 'Count', type: 'log' },
            margin: { t: 0 },
        },
    };

    const plot_type: Record<(typeof tab_items)[number], 'bar' | 'pie'> = {
        size_distribution: 'bar',
        structural_distribution: 'pie',
        elemental_distribution: 'bar',
    };

    const onPlot = async (name: (typeof tab_items)[number]) => {
        console.log(name);

        const csv_file = $post_analysis_files[name];
        if (!(await fs.exists(csv_file))) {
            toast.error(`File ${csv_file} does not exist`);
            return;
        }

        const { columns, data } = await parse_csv_file(csv_file);
        if (plot_type[name] !== 'pie') {
            plotData[name] = [
                {
                    x: data.map(row => row[0]),
                    y: data.map(row => row[1]),
                    type: plot_type[name],
                },
            ];
        } else {
            plotData[name] = [
                {
                    labels: data.map(row => row[0]),
                    values: data.map(row => row[1]),
                    type: 'pie',
                    textinfo: 'label+percent',
                    textposition: 'outside',
                    automargin: true,
                    // insidetextorientation: 'radial',
                },
            ];
        }
        console.log({ columns, data, plotData });
    };
</script>

<h3>Analysis plots</h3>

<div class="w-max">
    <TabBar tabs={[...tab_items]} let:tab bind:active={active_tab}>
        <Tab {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
</div>

{#each tab_items as name}
    <div class="grid gap-2 items-end" class:hidden={active_tab !== name}>
        <div class="grid grid-cols-5 items-end gap-2">
            <BrowseFile
                class="col-span-4"
                bind:filename={$post_analysis_files[name]}
                label="{name}.csv file"
                filters={[{ name: name, extensions: ['csv'] }]}
            />
            <button class="btn btn-sm" on:click={() => onPlot(name)}>Plot</button>
        </div>
        <div class="h-lg min-w-xl">
            <Plot data={plotData[name]} layout={layout[name]} fillParent={true} debounce={250} />
        </div>
    </div>
{/each}
