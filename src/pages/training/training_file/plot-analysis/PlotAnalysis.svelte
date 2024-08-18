<script lang="ts">
    import { post_analysis_files_directory, atoms_bin_size } from './stores';
    import { CustomInput, Loadingbtn } from '$lib/components';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { ChartColumnBig } from 'lucide-svelte';
    import Plot from 'svelte-plotly.js';
    import CheckFileStatus from '../CheckFileStatus.svelte';
    import { analysis_filename } from '../stores';
    import Slider from '@smui/slider';

    export let MolecularAnalysis: (mode: string) => Promise<{ pyfile: string; args: Record<string, any> }>;

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

    let atomic_size_range = [1, 200];
    let min_atomic_number = 1;
    let max_atomic_number = 50;

    const onPlot = async (name: (typeof tab_items)[number]) => {
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

        console.log({ x, y });

        if (name === 'size_distribution') {
            const max = Number(x.at(-1).split('-')[1]);
            max_atomic_number = max;
            atomic_size_range = [1, max];
            console.log({ atomic_size_range, max_atomic_number });
        }

        if (plot_type[name] === 'pie') {
            plotData[name] = [
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
            return;
        }

        plotData[name] = [{ x, y, type: plot_type[name] }];
    };

    const RunAnalysis = async (name: (typeof tab_items)[number]) => {
        if (!(await fs.exists(await path.join(await $post_analysis_files_directory, analysis_filename)))) {
            toast.error(`${analysis_filename} file does not exist`);
            return;
        }

        const csv_file = `${name}.csv`;
        if (await fs.exists(await path.join(await $post_analysis_files_directory, csv_file))) {
            const overwrite = await dialog.confirm(
                `${csv_file} file already exists. Do you want to overwrite it?`,
                'File exists',
            );
            if (!overwrite) {
                onPlot(name);
                return;
            }
        }
        console.log('running', name);
        return await MolecularAnalysis(name);
    };

    let recheck_files = false;
    onMount(async () => {
        recheck_files = !recheck_files;
        tab_items.forEach(async name => {
            const csv_file = `${name}.csv`;
            if (await fs.exists(await path.join(await $post_analysis_files_directory, csv_file))) {
                onPlot(name);
            }
        });
    });
</script>

<h3>Analysis plots</h3>

<div class="w-max">
    <TabBar tabs={[...tab_items]} let:tab bind:active={active_tab}>
        <Tab {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
</div>

{#each tab_items as name (name)}
    <div class="grid gap-2 items-end" class:hidden={active_tab !== name}>
        <CheckFileStatus name={name + '.csv'} bind:recheck_files />
        <div class="flex gap-2 items-end">
            <CustomInput
                label="Atoms bin size"
                bind:value={$atoms_bin_size}
                type="number"
                placeholder="Enter atoms bin size"
            />
            <Loadingbtn
                name="Run analysis"
                callback={async () => await RunAnalysis(name)}
                subprocess={true}
                on:result={() => {
                    recheck_files = !recheck_files;
                    onPlot(name);
                }}
            />
            <button class=" btn btn-sm" on:click={() => onPlot(name)}>
                <span>Plot</span>
                <ChartColumnBig />
            </button>
        </div>
        <div class="h-lg min-w-xl">
            <Plot data={plotData[name]} layout={layout[name]} fillParent={true} debounce={250} />
        </div>

        <h3>Filtering data</h3>
        {#if name === 'size_distribution'}
            <pre class="status">Atomic size range: {min_atomic_number} - {max_atomic_number}</pre>
            <Slider
                range
                bind:start={min_atomic_number}
                bind:end={max_atomic_number}
                min={atomic_size_range[0]}
                max={atomic_size_range[1]}
                step={1}
                minRange={1}
                input$aria-label="Range slider"
            />
        {/if}
    </div>
{/each}
