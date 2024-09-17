<script lang="ts">
    import { plot_data, results, model_names, model, test_size, include_training_file_in_plot } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import Plot from 'svelte-plotly.js';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import { PlotlyColors } from '$lib/utils';

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

    let test_data: Record<MLModel, ParsedData['test'] | null> = model_names.reduce<
        Record<MLModel, ParsedData['test'] | null>
    >(
        (acc, model) => {
            acc[model] = null;
            return acc;
        },
        {} as Record<MLModel, ParsedData['test'] | null>,
    );

    let train_data: Record<MLModel, ParsedData['train'] | null> = model_names.reduce<
        Record<MLModel, ParsedData['train'] | null>
    >(
        (acc, model) => {
            acc[model] = null;
            return acc;
        },
        {} as Record<MLModel, ParsedData['train'] | null>,
    );

    const on_plot_data_ready = async () => {
        test_data[$model] = null;
        train_data[$model] = null;

        try {
            const saved_file_contents = await fs.readTextFile(data_file);
            const parsed = JSON.parse(saved_file_contents) as ParsedData;
            test_data[$model] = parsed.test;
            train_data[$model] = parsed.train;
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
                ...$plot_data[$model],
                {
                    x: train_data[$model].y_true,
                    y: train_data[$model].y_pred,
                    mode: 'markers',
                    type: 'scatter',
                    name: 'TRAIN: Predicted',
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
            ];
        } catch (error) {
            toast.error('Error reading plot data\n' + error);
        }
    };

    $: if (plot_data_ready && data_file) {
        on_plot_data_ready();
    }

    const include_training_plot_if_required = async () => {
        if (!$plot_data[$model]?.length) return;
        if (!(train_data[$model] && test_data[$model])) return;

        if ($plot_data[$model].some(d => d.name.includes('TRAIN'))) {
            if ($include_training_file_in_plot) return;
            $plot_data[$model] = $plot_data[$model].filter(d => !d.name.includes('TRAIN'));
            return;
        }
        if (!$include_training_file_in_plot) return;
        $plot_data[$model] = [
            ...$plot_data[$model],
            {
                x: train_data[$model].y_true,
                y: train_data[$model].y_pred,
                mode: 'markers',
                type: 'scatter',
                name: 'TRAIN: Predicted',
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
        ];
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
        {#if $results[$model]}
            {@const r = $results[$model]}
            {@const train_stats = r.train_stats}
            {@const test_stats = r.test_stats}

            <div class="flex gap-1">
                <span class="badge badge-primary">
                    {r.time ? `completed in ${$results[$model].time}` : ''}
                </span>
                <span class="badge badge-primary">Dataset size: {r.data_shapes.y}</span>
                <!-- <span class="badge badge-info"># y_test_data_size ({$test_size}%): {r.data_shapes.y_test}</span> -->
            </div>
            <div class="grid grid-cols-6 gap-2 items-center w-3xl">
                <span class="badge badge-info col-span-2"
                    >Train stats ({100 - $test_size}% data = {r.data_shapes.y_train}):
                </span>
                <span class="badge">R<sup>2</sup>: {train_stats.r2}</span>
                <span class="badge">MSE: {train_stats.mse}</span>
                <span class="badge">RMSE: {train_stats.rmse}</span>
                <span class="badge">MAE: {train_stats.mae}</span>
            </div>
            <div class="grid grid-cols-6 gap-2 items-center w-3xl">
                <span class="badge badge-warning col-span-2"
                    >Test stats ({$test_size}% data = {r.data_shapes.y_test}):
                </span>
                <span class="badge">R<sup>2</sup>: {test_stats.r2}</span>

                <span class="badge">MSE: {test_stats.mse}</span>
                <span class="badge">RMSE: {test_stats.rmse}</span>
                <span class="badge">MAE: {test_stats.mae}</span>
            </div>

            {#if r.cross_validation && r.cv_scores}
                <span class="badge">{r.cv_fold}-fold CV - R<sup>2</sup>: {r.cv_scores.mean} ({r.cv_scores.std})</span>
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

        {#each model_names as model_name (model_name)}
            <div class="h-lg min-w-xl" class:hidden={model_name !== $model}>
                {#if $plot_data[model_name]}
                    <Plot
                        data={$plot_data[model_name]}
                        layout={{
                            title: `${model_name.toLocaleUpperCase()} Regressor`,
                            xaxis: { title: 'y_true' },
                            yaxis: { title: 'y_pred' },
                            // margin: { t: 0 },
                        }}
                        fillParent={true}
                        debounce={250}
                    />
                {/if}
            </div>
        {/each}
    </div>
</CustomPanel>
