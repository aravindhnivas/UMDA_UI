<script lang="ts">
    import {
        current_pretrained_file,
        include_training_file_in_plot,
        model,
        model_names,
        plot_data,
        results,
        test_size,
    } from './stores';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { PlotlyColors } from '$lib/utils';
    import Plot from 'svelte-plotly.js';
    import { CheckCheck } from 'lucide-svelte';

    export let data_file: string;
    export let plot_data_ready = false;

    interface ParsedData {
        test: {
            y_true: number[];
            y_pred: number[];
            y_linear_fit: number[];
        };
        train: {
            y_true: number[];
            y_pred: number[];
            y_linear_fit: number[];
        };
    }

    let test_data = {} as Record<MLModel, ParsedData['test']>;
    let train_data = {} as Record<MLModel, ParsedData['train']>;

    const on_plot_data_ready = async (datfile: string) => {
        try {
            const filename = await path.basename(datfile);
            const file_model = filename.split('_')[0] as MLModel;
            $model = file_model;
            console.log('Reading plot data\n', filename, file_model, $model);

            const saved_file_contents = await fs.readTextFile(datfile);
            const parsed = JSON.parse(saved_file_contents) as ParsedData;
            console.warn({ parsed });

            test_data[$model] = parsed.test;
            train_data[$model] = parsed.train;

            if (!(test_data[$model] && train_data[$model])) {
                toast.error('Error reading plot data');
                return;
            }

            $plot_data[$model] = [
                {
                    x: test_data[$model].y_true,
                    y: test_data[$model].y_pred,
                    mode: 'markers',
                    type: 'scattergl',
                    name: 'TEST: Predicted',
                    marker: { color: PlotlyColors.muted_blue },
                },
                {
                    x: test_data[$model].y_true,
                    y: test_data[$model].y_linear_fit,
                    mode: 'lines',
                    type: 'scattergl',
                    name: 'TEST: fit',
                    line: { color: PlotlyColors.muted_blue },
                },
            ];
            if (!$include_training_file_in_plot) return;
            $plot_data[$model] = [
                {
                    x: train_data[$model].y_true,
                    y: train_data[$model].y_pred,
                    mode: 'markers',
                    type: 'scattergl',
                    name: 'TRAIN: Predicted',
                    opacity: 0.5,
                    marker: { color: PlotlyColors.safety_orange },
                },
                {
                    x: train_data[$model].y_true,
                    y: train_data[$model].y_linear_fit,
                    mode: 'lines',
                    type: 'scattergl',
                    name: 'TRAIN: Linear fit',
                    line: { color: PlotlyColors.safety_orange },
                },
                ...$plot_data[$model],
            ];
        } catch (error) {
            toast.error('Error reading plot data\n' + error);
        }
    };

    $: if (plot_data_ready && data_file) {
        on_plot_data_ready(data_file);
    }

    const include_training_plot_if_required = async () => {
        console.log('include_training_plot_if_required', $include_training_file_in_plot);
        console.log($plot_data[$model]);
        if (!$plot_data[$model]?.length) {
            console.warn('No plot data found');
            return;
        }
        if (!(train_data[$model] && test_data[$model])) {
            console.log({ train_data, test_data, $model });
            console.warn('No training data found');
            return;
        }

        if ($plot_data[$model].some(d => d.name?.includes('TRAIN'))) {
            console.warn('Removing training data from plot');
            if ($include_training_file_in_plot) return;
            $plot_data[$model] = $plot_data[$model].filter(d => !d.name?.includes('TRAIN'));
            console.log($plot_data[$model]);
            return;
        }
        console.log($plot_data[$model]);
        if (!$include_training_file_in_plot) return;
        console.warn('Adding training data to plot');
        $plot_data[$model] = [
            {
                x: train_data[$model].y_true,
                y: train_data[$model].y_pred,
                mode: 'markers',
                type: 'scattergl',
                name: 'TRAIN: Predicted',
                opacity: 0.5,
                marker: { color: PlotlyColors.safety_orange },
            },
            {
                x: train_data[$model].y_true,
                y: train_data[$model].y_linear_fit,
                mode: 'lines',
                type: 'scattergl',
                name: 'TRAIN: Linear fit',
                line: { color: PlotlyColors.safety_orange },
            },
            ...$plot_data[$model],
        ];

        console.log($plot_data[$model]);
    };

    let datfile: string = '';
    let resultsfile: string = '';

    const get_pretrained_file = async () => {
        let pretrained_file = await $current_pretrained_file;
        if (pretrained_file.endsWith('.pkl')) {
            pretrained_file = pretrained_file.replace('.pkl', '');
        }

        datfile = pretrained_file + '.dat.json';
        resultsfile = pretrained_file + '.results.json';
    };

    $: if ($model) get_pretrained_file();

    const plot_from_datfile = async () => {
        await on_plot_data_ready(datfile);
        console.log('Reading results file', resultsfile);

        if (!(await fs.exists(resultsfile))) return;

        const results_data = await fs.readTextFile(resultsfile);
        const parsed_results = JSON.parse(results_data);
        console.log(parsed_results);
        if (!$results) $results = {};
        $results[$model] = parsed_results;
    };

    const get_learning_curve_data = (
        learningCurveData: Record<string, Record<'test' | 'train', { mean: string; std: string; scores?: number[] }>>,
    ) => {
        // Prepare the data for plotting
        const trainingSizes = Object.keys(learningCurveData).map(Number);
        const testScores = trainingSizes.map(size => parseFloat(learningCurveData[size].test.mean));
        const testStd = trainingSizes.map(size => parseFloat(learningCurveData[size].test.std));
        const trainScores = trainingSizes.map(size => parseFloat(learningCurveData[size].train.mean));
        const trainStd = trainingSizes.map(size => parseFloat(learningCurveData[size].train.std));

        // Create traces for test and train scores with error bars
        const testTrace = {
            x: trainingSizes,
            y: testScores,
            error_y: {
                type: 'data',
                array: testStd,
                visible: true,
            },
            mode: 'lines+markers',
            name: 'Test',
            type: 'scattergl',
        };

        const trainTrace = {
            x: trainingSizes,
            y: trainScores,
            error_y: {
                type: 'data',
                array: trainStd,
                visible: true,
            },
            mode: 'lines+markers',
            name: 'Train',
            type: 'scattergl',
        };

        // Define the layout
        const layout: Partial<Plotly.Layout> = {
            title: 'Learning Curve',
            xaxis: {
                title: 'Training Data Size',
                tickmode: 'array',
                tickvals: trainingSizes,
            },
            yaxis: {
                title: 'R<sup>2</sup> - Score',
                // range: [0.6, 1.1], // Adjusted to better show the error bars
            },
            // legend: {
            //     x: 0.1,
            //     y: 1,
            // },
        };

        return { data: [trainTrace, testTrace], layout };
    };
</script>

<CustomPanel open={true} title="Results - {$model.toLocaleUpperCase()} Regressor">
    {#await fs.exists(datfile) then file_exists}
        {#if file_exists}
            <div class="grid grid-cols-[4fr_1fr] items-center gap-4">
                <div class="alert alert-success">
                    <CheckCheck />
                    <span>Computed results are available to plot</span>
                </div>
                <button class="btn btn-outline" on:click={plot_from_datfile}>Plot</button>
            </div>
        {/if}
    {/await}

    <div class="flex my-2">
        <Checkbox
            bind:value={$include_training_file_in_plot}
            label="Plot training data"
            on:change={include_training_plot_if_required}
        />
    </div>

    <div class="grid gap-2">
        {#if $results?.[$model]}
            {@const r = $results[$model]}
            {#if r}
                {@const train_stats = r.train_stats}
                {@const test_stats = r.test_stats}
                {@const learning_curve_data = r.learning_curve}

                <div class="flex gap-1">
                    <span class="badge badge-primary">
                        {r.time ? `completed in ${r.time}` : ''}
                    </span>
                    <span class="badge badge-primary">Dataset size: {r.data_shapes.y}</span>
                </div>
                <div class="grid grid-cols-6 gap-2 items-center w-3xl">
                    <span class="col-span-2"></span>
                    <span class="badge">R<sup>2</sup></span>
                    <span class="badge">MSE</span>
                    <span class="badge">RMSE</span>
                    <span class="badge">MAE</span>
                </div>
                <div class="grid grid-cols-6 gap-2 items-center w-3xl">
                    <span class="badge badge-warning col-span-2"
                        >Train stats ({100 - $test_size}% data = {r.data_shapes.y_train}):
                    </span>
                    <span class="badge badge-warning">{train_stats.r2}</span>
                    <span class="badge badge-warning">{train_stats.mse}</span>
                    <span class="badge badge-warning">{train_stats.rmse}</span>
                    <span class="badge badge-warning">{train_stats.mae}</span>
                </div>
                {#if r.cross_validation && r.cv_scores?.train}
                    {@const rcv = r.cv_scores?.train}
                    <div class="grid grid-cols-6 gap-2 items-center w-3xl">
                        <span class="badge col-span-2">{r.cv_fold}-fold CV:</span>
                        <span class="badge">{rcv.r2.mean.toFixed(2)} ({rcv.r2.std.toFixed(2)})</span>
                        <span class="badge">{rcv.mse.mean.toFixed(2)} ({rcv.mse.std.toFixed(2)})</span>
                        <span class="badge">{rcv.rmse.mean.toFixed(2)} ({rcv.rmse.std.toFixed(2)})</span>
                        <span class="badge">{rcv.mae.mean.toFixed(2)} ({rcv.mae.std.toFixed(2)})</span>
                    </div>
                {/if}

                <div class="grid grid-cols-6 gap-2 items-center w-3xl">
                    <span class="badge badge-info col-span-2"
                        >Test stats ({$test_size}% data = {r.data_shapes.y_test}):
                    </span>
                    <span class="badge badge-info">{test_stats.r2}</span>

                    <span class="badge badge-info">{test_stats.mse}</span>
                    <span class="badge badge-info">{test_stats.rmse}</span>
                    <span class="badge badge-info">{test_stats.mae}</span>
                </div>

                {#if r.cross_validation && r.cv_scores?.test}
                    {@const rcv = r.cv_scores?.test}
                    <div class="grid grid-cols-6 gap-2 items-center w-3xl">
                        <span class="badge col-span-2">{r.cv_fold}-fold CV:</span>
                        <span class="badge">{rcv.r2.mean.toFixed(2)} ({rcv.r2.std.toFixed(2)})</span>
                        <span class="badge">{rcv.mse.mean.toFixed(2)} ({rcv.mse.std.toFixed(2)})</span>
                        <span class="badge">{rcv.rmse.mean.toFixed(2)} ({rcv.rmse.std.toFixed(2)})</span>
                        <span class="badge">{rcv.mae.mean.toFixed(2)} ({rcv.mae.std.toFixed(2)})</span>
                    </div>
                {/if}

                {#if r.best_params}
                    <hr />
                    <div class="grid gap-2">
                        <h3>Best parameters</h3>
                        <span class="text-sm">Best score: {r.best_score}</span>
                        <div class="flex gap-2 flex-wrap">
                            {#each Object.entries(r.best_params) as [key, value]}
                                <span class="badge badge-info">{key}: {value}</span>
                            {/each}
                        </div>
                    </div>
                    <hr />
                {/if}
                {#if learning_curve_data}
                    {@const { data, layout } = get_learning_curve_data(learning_curve_data)}
                    <div style="height: 500px;">
                        <Plot {data} {layout} fillParent={true} debounce={250} />
                    </div>
                {/if}
            {/if}
        {/if}

        {#each model_names as model_name (model_name)}
            <div style="height: 500px;" class:hidden={model_name !== $model}>
                {#if $plot_data[model_name]}
                    <Plot
                        data={$plot_data[model_name]}
                        layout={{
                            title: `${model_name.toLocaleUpperCase()} Regressor`,
                            xaxis: { title: 'y_true' },
                            yaxis: { title: 'y_pred' },
                        }}
                        fillParent={true}
                        debounce={250}
                    />
                {/if}
            </div>
        {/each}
    </div>

    <!-- <div style="height: 500px;">
        <Plot data={fill_between().data} layout={fill_between().layout} fillParent={true} debounce={250} />
    </div> -->
</CustomPanel>
