<script lang="ts">
    import { PlotlyColors } from '$lib/utils/index';
    import { use_dask } from '$lib/stores/system';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { training_column_name_y, training_file, training_save_directory } from '../stores';
    import { active_tab } from './stores';
    import Plot from 'svelte-plotly.js';

    let data: Partial<Plotly.PlotData>[] = [];

    const analysis_y_data_distribution = async () => {
        return {
            pyfile: 'training.y_data_distribution',
            args: {
                filename: $training_file.filename,
                filetype: $training_file.filetype,
                key: $training_file.key,
                use_dask: $use_dask,
                column_name: $training_column_name_y,
                training_save_directory: $training_save_directory,
                bin_size,
            },
        };
    };

    const layout = {
        title: `${$training_column_name_y} Distribution`,
        xaxis: {
            title: 'Bin Edges',
        },
        yaxis: {
            title: 'Counts',
        },
    };

    const onResult = async (e: CustomEvent) => {
        console.log(e.detail);
        const { dataFromPython } = e.detail;
        if (!dataFromPython) return;
        console.log(dataFromPython);
        const filename = dataFromPython.filename;
        if (!filename) return;

        const contents = await fs.readTextFile(filename);
        const { hist, bin_edges } = JSON.parse(contents);
        // Create x values for Plotly bar chart
        console.log({ contents, hist, bin_edges });
        let xValues = [];
        for (let i = 0; i < bin_edges.length - 1; i++) {
            xValues.push((bin_edges[i] + bin_edges[i + 1]) / 2);
        }
        data = [
            {
                x: xValues,
                y: hist,
                type: 'bar',
                marker: {
                    color: PlotlyColors.muted_blue,
                    line: {
                        width: 1.5,
                    },
                },
            },
        ];
    };

    let bin_size: string | number = 30;
</script>

<div class="grid gap-2" class:hidden={$active_tab !== 'y-data_distribution'}>
    <span class="badge">using {$training_column_name_y} column to analyse distribution</span>
    <div class="flex items-end gap-1">
        <CustomInput bind:value={bin_size} label="Bin" type="number" />
        <Loadingbtn callback={analysis_y_data_distribution} on:result={onResult} />
    </div>
    <div class="h-lg min-w-xl">
        <Plot {data} {layout} fillParent={true} debounce={250} />
    </div>
</div>
