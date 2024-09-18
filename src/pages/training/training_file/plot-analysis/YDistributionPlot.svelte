<script lang="ts">
    import { PlotlyColors } from '$lib/utils/index';
    import { use_dask } from '$lib/stores/system';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { training_column_name_y, training_file, training_save_directory } from '../stores';
    import { active_tab } from './stores';
    import Plot from 'svelte-plotly.js';
    import YdataStats from './YdataPlots/YdataStats.svelte';
    import Yplots from './YdataPlots/Yplots.svelte';
    // import Checkbox from '$lib/components/Checkbox.svelte';

    const analysis_y_data_distribution = async () => {
        if (!$training_column_name_y) {
            toast.error('Please select a column to analyse');
            return;
        }
        return {
            pyfile: 'training.y_data_distribution',
            args: {
                filename: $training_file.filename,
                filetype: $training_file.filetype,
                key: $training_file.key,
                use_dask: $use_dask,
                property_column: $training_column_name_y,
                save_loc: $training_save_directory,
                bin_size,
                auto_bin_size,
            },
        };
    };

    let plots_data_and_layout: { data: any; layout: any }[] = [];
    let data: any = {};
    // let histogramData: Partial<Plotly.Bar>[] = [];
    // const histogramLayout = {
    //     // title: 'Histogram',
    //     xaxis: { title: 'Value' },
    //     yaxis: { title: 'Frequency' },
    // };

    // let boxPlotData: Partial<Plotly.BoxPlotData>[] = [];
    // const boxPlotLayout = {
    //     // title: 'Box Plot',
    //     yaxis: { title: 'Value' },
    //     // xaxis: { title: '' },
    // };

    // let qqPlotData: Partial<Plotly.ScatterData>[] = [];
    // const qqPlotLayout = {
    //     title: 'Q-Q Plot',
    //     xaxis: { title: 'Theoretical Quantiles' },
    //     yaxis: { title: 'Sample Quantiles' },
    // };

    let dataFromPython = {} as {
        savefile: string;
        stats: {
            min: number;
            max: number;
            mean: number;
            std: number;
            count: number;
            '25%': number;
            '50%': number;
            '75%': number;
        };
    };

    const onResult = async (e: CustomEvent) => {
        console.log(e.detail);
        dataFromPython = e.detail?.dataFromPython;
        if (!dataFromPython) return;
        console.log(dataFromPython);
        const savefile = dataFromPython.savefile;
        if (!savefile) return;
        const contents = await fs.readTextFile(savefile);
        data = JSON.parse(contents);

        console.warn({ data });
        // return;

        const histogramTrace = {
            x: data.histogram.bin_edges.slice(0, -1),
            y: data.histogram.counts,
            type: 'bar',
            name: 'Histogram',
        };

        const histogramLayout = {
            title: 'Histogram',
            xaxis: { title: 'Value' },
            yaxis: { title: 'Frequency' },
        };

        // Plotly.newPlot('histogram', [histogramTrace], histogramLayout);

        // 2. Box Plot
        const boxPlotTrace = {
            y: [data.box_plot.min, data.box_plot.q1, data.box_plot.median, data.box_plot.q3, data.box_plot.max],
            type: 'box',
            name: 'Box Plot',
        };

        const boxPlotLayout = {
            title: 'Box Plot',
            yaxis: { title: 'Value' },
        };

        // Plotly.newPlot('boxplot', [boxPlotTrace], boxPlotLayout);

        // 3. Q-Q Plot
        const qqPlotTrace = {
            x: data.qq_plot.theoretical_quantiles,
            y: data.qq_plot.sample_quantiles,
            mode: 'markers',
            type: 'scatter',
            name: 'Q-Q Plot',
        };

        const qqPlotLayout = {
            title: 'Q-Q Plot',
            xaxis: { title: 'Theoretical Quantiles' },
            yaxis: { title: 'Sample Quantiles' },
        };

        // Plotly.newPlot('qqplot', [qqPlotTrace], qqPlotLayout);

        // 4. KDE Plot
        const kdePlotTrace = {
            x: data.kde.x,
            y: data.kde.y,
            type: 'scatter',
            mode: 'lines',
            name: 'KDE',
        };

        const kdePlotLayout = {
            title: 'Kernel Density Estimation',
            xaxis: { title: 'Value' },
            yaxis: { title: 'Density' },
        };

        plots_data_and_layout = [
            { data: [histogramTrace], layout: histogramLayout },
            { data: [boxPlotTrace], layout: boxPlotLayout },
            { data: [qqPlotTrace], layout: qqPlotLayout },
            { data: [kdePlotTrace], layout: kdePlotLayout },
        ];
    };
    let auto_bin_size: boolean = true;
    let bin_size: string | number = 30;
</script>

<div class="grid gap-2" class:hidden={$active_tab !== 'y-data_distribution'}>
    <span class="badge badge-primary">{$training_column_name_y}</span>
    <YdataStats {data} />
    <div class="flex items-end gap-1">
        <!-- <Checkbox bind:value={auto_bin_size} label="auto bin_size" /> -->
        <CustomInput bind:value={bin_size} label="bin_size" type="number" disabled={auto_bin_size} />
        <Loadingbtn callback={analysis_y_data_distribution} on:result={onResult} name="Run Analysis" />
    </div>
    <Yplots {plots_data_and_layout} />
</div>
