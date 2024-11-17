<script lang="ts">
    import { use_dask } from '$lib/stores/system';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import { training_column_name_y, training_file } from '../stores';
    import { active_tab, current_training_data_file, filtered_dir, YDistributionFilter } from './stores';
    import {
        savefilename,
        min_yvalue,
        max_yvalue,
        ytransformation,
        y_data_distribution_savefilename,
        save_loc_for_ydistribution_data,
    } from './YdataPlots/stores';
    import YdataStats from './YdataPlots/YdataStats.svelte';
    import Yplots from './YdataPlots/Yplots.svelte';
    import NormalLoadingBtn from '$lib/components/NormalLoadingBtn.svelte';
    import { Checkbox, CustomSelect } from '$lib/components';

    const analysis_y_data_distribution = async () => {
        if (!$training_column_name_y) {
            toast.error('Please select a column to analyse');
            return;
        }
        current_skewness = null;

        $YDistributionFilter.min_yvalue.lock = true;
        $YDistributionFilter.max_yvalue.lock = true;

        const save_loc = await $save_loc_for_ydistribution_data;
        // if (!(await fs.exists(save_loc))) {
        //     await fs.create(save_loc, { recursive: true });
        // }

        if (auto_transform_data) {
            $ytransformation = 'None';
            const all_skewness_savefile = await path.join(save_loc, 'skewness_after_all_transformation.json');
            if (await fs.exists(all_skewness_savefile)) {
                const overwrite = await dialog.confirm(
                    'All skew values computed file already exists. Do you want to overwrite?',
                    {
                        title: 'Overwrite file?',
                        kind: 'warning',
                    },
                );
                if (!overwrite) {
                    const parsed_contents = await readJSON<{
                        best_skew_key: string;
                        skews: Record<string, number>;
                    }>(all_skewness_savefile);
                    if (!parsed_contents) return;

                    $ytransformation = parsed_contents.best_skew_key;
                    await read_and_plot();
                    return;
                }
            }
        } else {
            const savefile = await path.join(save_loc, $savefilename);
            if (await fs.exists(savefile)) {
                const overwrite = await dialog.confirm('File already exists. Do you want to overwrite?', {
                    title: 'Overwrite file?',
                    type: 'warning',
                });
                if (!overwrite) return read_and_plot(savefile);
            }
        }

        return {
            pyfile: 'training.y_data_distribution',
            args: {
                filename: await $current_training_data_file,
                filetype: $training_file.filetype,
                key: $training_file.key,
                use_dask: $use_dask,
                property_column: $training_column_name_y,
                save_loc,
                savefilename: $y_data_distribution_savefilename,
                bin_size,
                auto_transform_data,
                ytransformation: $ytransformation === 'None' ? null : $ytransformation,
            },
        };
    };

    let plots_data: YDistributionPlotData | null = null;
    let data: YDistributionStats | null = null;
    let current_skewness: number | null = null;
    let applied_transformation = '';

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
        dataFromPython = e.detail?.dataFromPython;
        if (!dataFromPython) return;
        console.log(dataFromPython);
        const savefile = dataFromPython.savefile;

        if (!savefile) {
            toast.error('Failed to save the file');
            plots_data = null;
            return;
        }
        await read_and_plot(savefile);
    };

    const read_and_plot = async (savefile: string | null = null, notify = true) => {
        try {
            if (savefile === null) {
                savefile = await path.join(await $save_loc_for_ydistribution_data, $savefilename);
            }

            if (!(await fs.exists(savefile))) {
                if (notify) toast.error('File does not exist. Run the analysis first');
                return;
            }
            console.warn('Reading file', savefile);
            const contents = await fs.readTextFile(savefile);
            applied_transformation = '';
            data = JSON.parse(contents) as YDistributionStats;
            console.warn({ data });
            current_skewness = data.skewness;
            if (!data) {
                if (notify) toast.error('Failed to read the saved file');
                return;
            }

            $min_yvalue = String(data.descriptive_statistics.min);
            $max_yvalue = String(data.descriptive_statistics.max);

            applied_transformation = data?.applied_transformation || 'None';
            console.warn({ applied_transformation });
            $ytransformation = applied_transformation;

            const hist_bin_size = data.histogram.bin_size;
            console.warn({ hist_bin_size });

            const histogramTrace: Partial<Plotly.PlotData> = {
                x: data.histogram.bin_edges.slice(0, -1), // Remove the last bin edge to match the number of counts
                y: data.histogram.counts,
                type: 'bar',
                name: `Bins: ${data.histogram.counts.length}, bin_size: ${hist_bin_size.toFixed(2)}`,
                showlegend: true,
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
                type: 'scattergl',
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

            if (notify) toast.success('Y data distribution plots are ready and displayed');
        } catch (error) {
            if (notify) toast.error('Failed to read the saved file');
        }
    };

    let bin_size: string | number = 30;

    $: if ($filtered_dir || $training_file.filename) {
        data = null;
        plots_data = null;
    }

    let auto_transform_data = false;

    const transformations = {
        default: ['None'],
        for_positive_skewness: ['log1p', 'sqrt', 'reciprocal'],
        for_negative_skewness: ['square', 'exp'],
        for_all_positive_data: ['boxcox'],
        for_all_data: ['yeo_johnson'],
    };
</script>

<div class="grid gap-2" class:hidden={$active_tab !== 'y-data_distribution'}>
    {#if $training_column_name_y}
        <span class="badge badge-primary">{$training_column_name_y}</span>
    {/if}
    <div class="flex items-end gap-1">
        <Checkbox bind:value={auto_transform_data} label="auto_transform_data" />
        <CustomSelect
            items={transformations}
            label="y-transformation"
            bind:value={$ytransformation}
            disabled={auto_transform_data}
        />
        <Loadingbtn callback={analysis_y_data_distribution} on:result={onResult} name="Run Analysis" />
        <NormalLoadingBtn name="Plot" callback={read_and_plot} />
    </div>

    {#if applied_transformation}
        <span class="badge badge-info text-sm">Best data transformation applied: {applied_transformation}</span>
    {/if}

    {#if data}
        <YdataStats {data} />
    {/if}
    {#if plots_data && Object.keys(plots_data).length > 0}
        <Yplots {plots_data} />
    {/if}
</div>
