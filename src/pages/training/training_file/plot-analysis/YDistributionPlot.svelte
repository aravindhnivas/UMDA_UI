<script lang="ts">
    import { PlotlyColors } from '$lib/utils/index';
    import { use_dask } from '$lib/stores/system';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { training_column_name_y, training_file, training_save_directory } from '../stores';
    import { active_tab } from './stores';
    import Plot from 'svelte-plotly.js';
    import Checkbox from '$lib/components/Checkbox.svelte';

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
                auto_bin_size,
            },
        };
    };

    const layout = {
        title: `${$training_column_name_y} Distribution`,
        xaxis: { title: 'Value' },
        yaxis: { title: 'Frequency' },
    };

    const onResult = async (e: CustomEvent) => {
        console.log(e.detail);
        const { dataFromPython } = e.detail;
        if (!dataFromPython) return;
        console.log(dataFromPython);
        const filename = dataFromPython.filename;
        if (!filename) return;

        if (auto_bin_size) {
            bin_size = dataFromPython.bin_size;
        }
        const contents = await fs.readTextFile(filename);
        const parsed_data = JSON.parse(contents);
        console.log({ parsed_data });
        const { hist, bin_edges } = parsed_data;
        // Create x values for Plotly bar chart
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
    let auto_bin_size: boolean = true;
    let bin_size: string | number = 30;
</script>

<div class="grid gap-2" class:hidden={$active_tab !== 'y-data_distribution'}>
    <span class="badge">using {$training_column_name_y} column to analyse distribution</span>

    <div class="flex items-end gap-1">
        <Checkbox bind:value={auto_bin_size} label="auto bin_size" />
        <CustomInput bind:value={bin_size} label="bin_size" type="number" disabled={auto_bin_size} />
        <Loadingbtn callback={analysis_y_data_distribution} on:result={onResult} />
    </div>
    <div class="h-lg min-w-xl">
        <Plot {data} {layout} fillParent={true} debounce={250} />
    </div>
</div>
