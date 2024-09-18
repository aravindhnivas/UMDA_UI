<script lang="ts">
    import { use_dask } from '$lib/stores/system';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import { training_column_name_y, training_file } from '../stores';
    import {
        active_tab,
        current_post_analysis_files_directory,
        current_training_data_file,
        filtered_dir,
    } from './stores';
    import YdataStats from './YdataPlots/YdataStats.svelte';
    import Yplots from './YdataPlots/Yplots.svelte';

    const savefilename = 'y_data_distribution.json';

    const analysis_y_data_distribution = async () => {
        if (!$training_column_name_y) {
            toast.error('Please select a column to analyse');
            return;
        }
        return {
            pyfile: 'training.y_data_distribution',
            args: {
                filename: await $current_training_data_file,
                filetype: $training_file.filetype,
                key: $training_file.key,
                use_dask: $use_dask,
                property_column: $training_column_name_y,
                save_loc: await $current_post_analysis_files_directory,
                savefilename: savefilename,
                bin_size,
            },
        };
    };

    let plots_data: YDistributionPlotData | null = null;

    let data: any = {};

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

        if (!savefile) {
            toast.error('Failed to save the file');
            plots_data = null;
            return;
        }
        read_and_plot(savefile);
    };

    const read_and_plot = async (savefile: string | null = null) => {
        try {
            // if (!(await fs.exists(savedfile))) return toast.error('File not found');
            if (savefile === null) {
                savefile = await path.join(await $current_post_analysis_files_directory, savefilename);
            }
            const contents = await fs.readTextFile(savefile);

            data = JSON.parse(contents);
            console.warn({ data });
            // return;

            const histogramTrace: Partial<Plotly.PlotData> = {
                x: data.histogram.bin_edges.slice(0, -1),
                y: data.histogram.counts,
                type: 'bar',
                name: 'Histogram',
            };

            // 2. Box Plot
            const boxPlotTrace: Partial<Plotly.PlotData> = {
                y: [data.box_plot.min, data.box_plot.q1, data.box_plot.median, data.box_plot.q3, data.box_plot.max],
                type: 'box',
                name: 'Box Plot',
            };

            // 3. Q-Q Plot
            const qqPlotTrace: Partial<Plotly.PlotData> = {
                x: data.qq_plot.theoretical_quantiles,
                y: data.qq_plot.sample_quantiles,
                mode: 'markers',
                type: 'scatter',
                name: 'Q-Q Plot',
            };

            // 4. KDE Plot
            const kdePlotTrace: Partial<Plotly.PlotData> = {
                x: data.kde.x,
                y: data.kde.y,
                type: 'scatter',
                mode: 'lines',
                name: 'KDE',
            };

            plots_data = {
                histogram: [histogramTrace],
                kde: [kdePlotTrace],
                box_plot: [boxPlotTrace],
                qq_plot: [qqPlotTrace],
            };

            toast.success('Analysis complete');
        } catch (error) {
            console.error(error);
            toast.error('Failed to read the saved file');
        }
    };
    let bin_size: string | number = 30;

    $: if ($filtered_dir) {
    }
</script>

<div class="grid gap-2" class:hidden={$active_tab !== 'y-data_distribution'}>
    <span class="badge badge-primary">{$training_column_name_y}</span>
    <div class="flex items-end gap-1">
        <Loadingbtn callback={analysis_y_data_distribution} on:result={onResult} name="Run Analysis" />
        <button
            class="btn btn-sm"
            on:click={async () => {
                read_and_plot();
            }}>Plot</button
        >
    </div>
    <YdataStats {data} />
    {#if plots_data && Object.keys(plots_data).length > 0}
        <Yplots {plots_data} />
    {/if}
</div>
