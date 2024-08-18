<script lang="ts">
    import { post_analysis_files_directory, atoms_bin_size } from './stores';
    import { CustomInput, Loadingbtn } from '$lib/components';
    import { ChartColumnBig } from 'lucide-svelte';
    import Plot from 'svelte-plotly.js';
    import CheckFileStatus from '../CheckFileStatus.svelte';
    import { analysis_filename } from '../stores';

    export let name: AnalysisItemsType;
    export let hidden: boolean = false;

    const MolecularAnalysis = getContext<MolecularAnalysisFunction>('MolecularAnalysis');

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

    const layout: Record<AnalysisItemsType, Partial<Plotly.Layout>> = {
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

    const plot_type: Record<AnalysisItemsType, 'bar' | 'pie'> = {
        size_distribution: 'bar',
        structural_distribution: 'pie',
        elemental_distribution: 'bar',
    };

    const dispatch = createEventDispatcher();

    const onPlot = async (name: AnalysisItemsType) => {
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

        if (name === 'structural_distribution') {
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
        } else {
            plotData[name] = [{ x, y, type: plot_type[name] }];
        }
        dispatch('plot', { x, y });
    };

    const RunAnalysis = async (name: AnalysisItemsType) => {
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
        // const csv_file = `${name}.csv`;
        // if (await fs.exists(await path.join(await $post_analysis_files_directory, csv_file))) {
        //     onPlot(name);
        // }
    });
</script>

<div class="grid gap-2 items-end" class:hidden>
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
            on:result={async () => {
                recheck_files = !recheck_files;
                await onPlot(name);
            }}
        />
        <button class=" btn btn-sm" on:click={() => onPlot(name)}>
            <span>Plot</span>
            <ChartColumnBig />
        </button>
    </div>

    <slot name="before-plot" />

    <div class="h-lg min-w-xl">
        <Plot data={plotData[name]} layout={layout[name]} fillParent={true} debounce={250} />
    </div>
    <slot />
</div>
