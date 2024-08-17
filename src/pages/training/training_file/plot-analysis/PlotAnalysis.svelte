<script lang="ts">
    import { post_analysis_files_directory, atoms_bin_size } from './stores';
    import { CustomInput, Loadingbtn } from '$lib/components';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { ChartColumnBig } from 'lucide-svelte';
    import Plot from 'svelte-plotly.js';
    import CheckFileStatus from '../CheckFileStatus.svelte';
    import { analysis_filename } from '../stores';

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

    const onPlot = async (name: (typeof tab_items)[number]) => {
        // const csv_file = $post_analysis_files[name];
        const csv_file = await path.join(await $post_analysis_files_directory, `${name}.csv`);
        // console.log(csv_file);
        if (!(await fs.exists(csv_file))) {
            toast.error(`File ${csv_file} does not exist`);
            return;
        }

        const { columns, data } = await parse_csv_file(csv_file);
        if (plot_type[name] === 'pie') {
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
            return;
        }

        plotData[name] = [
            {
                x: data.map(row => row[0]),
                y: data.map(row => row[1]),
                type: plot_type[name],
            },
        ];
        console.log({ columns, data, plotData });
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

{#each tab_items as name}
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
    </div>
{/each}
