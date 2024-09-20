<script lang="ts">
    import { include_training_file_in_plot, model, model_names, plot_data, results, test_size } from './stores';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { PlotlyColors } from '$lib/utils';
    import Plot from 'svelte-plotly.js';

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

    const on_plot_data_ready = async () => {
        try {
            const filename = await path.basename(data_file);
            const file_model = filename.split('_')[0] as MLModel;
            $model = file_model;
            console.log('Reading plot data\n', filename, file_model, $model);

            const saved_file_contents = await fs.readTextFile(data_file);
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
                    type: 'scatter',
                    name: 'TEST: Predicted',
                    marker: { color: PlotlyColors.muted_blue },
                },
                {
                    x: test_data[$model].y_true,
                    y: test_data[$model].y_linear_fit,
                    mode: 'lines',
                    type: 'scatter',
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
                    type: 'scatter',
                    name: 'TRAIN: Predicted',
                    opacity: 0.5,
                    marker: { color: PlotlyColors.safety_orange },
                },
                {
                    x: train_data[$model].y_true,
                    y: train_data[$model].y_linear_fit,
                    mode: 'lines',
                    type: 'scatter',
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
        on_plot_data_ready();
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
                type: 'scatter',
                name: 'TRAIN: Predicted',
                opacity: 0.5,
                marker: { color: PlotlyColors.safety_orange },
            },
            {
                x: train_data[$model].y_true,
                y: train_data[$model].y_linear_fit,
                mode: 'lines',
                type: 'scatter',
                name: 'TRAIN: Linear fit',
                line: { color: PlotlyColors.safety_orange },
            },
            ...$plot_data[$model],
        ];
        console.log($plot_data[$model]);
    };
</script>

<CustomPanel open={true} title="Results - {$model.toLocaleUpperCase()} Regressor">
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
                    <span class="badge">{train_stats.r2}</span>
                    <span class="badge">{train_stats.mse}</span>
                    <span class="badge">{train_stats.rmse}</span>
                    <span class="badge">{train_stats.mae}</span>
                </div>
                <div class="grid grid-cols-6 gap-2 items-center w-3xl">
                    <span class="badge badge-info col-span-2"
                        >Test stats ({$test_size}% data = {r.data_shapes.y_test}):
                    </span>
                    <span class="badge">{test_stats.r2}</span>

                    <span class="badge">{test_stats.mse}</span>
                    <span class="badge">{test_stats.rmse}</span>
                    <span class="badge">{test_stats.mae}</span>
                </div>

                {#if r.cross_validation && r.cv_scores}
                    <span class="badge"
                        >{r.cv_fold}-fold CV - R<sup>2</sup>: {r.cv_scores.mean} ({r.cv_scores.std})</span
                    >
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
            {/if}
        {/if}

        {#each model_names as model_name (model_name)}
            <div class="h-lg min-w-xl" class:hidden={model_name !== $model}>
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
</CustomPanel>
