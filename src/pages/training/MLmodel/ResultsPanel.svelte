<script lang="ts">
    import {
        current_pretrained_file,
        include_training_file_in_plot,
        learning_curve,
        model,
        plot_data,
        results,
    } from './stores';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { PlotlyColors } from '$lib/utils';
    import { CheckCheck } from 'lucide-svelte/icons';
    import { CustomInput } from '$lib/components';
    import ResultsStats from './results-subcomponents/ResultsStats.svelte';

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
            if ($include_training_file_in_plot) {
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
            }

            await get_pretrained_file();
            if ($learning_curve.active) {
                await get_learning_curve_data(learning_curve_file);
            }
        } catch (error) {
            toast.error('Error reading plot data\n' + error);
        }
    };

    const include_training_plot_if_required = async () => {
        console.log('include_training_plot_if_required', $include_training_file_in_plot);
        console.log($plot_data[$model]);
        if (!$plot_data?.[$model]) return;

        if (!$plot_data[$model]?.length) {
            console.warn('No plot data found');
            return;
        }

        if (!(train_data[$model] && test_data[$model])) {
            console.log({ train_data, test_data, $model });
            console.warn('No training data found');
            return;
        }

        if ($plot_data[$model]?.some(d => d.name?.includes('TRAIN'))) {
            console.warn('Removing training data from plot');
            if ($include_training_file_in_plot) return;
            $plot_data[$model] = $plot_data[$model]?.filter(d => !d.name?.includes('TRAIN')) ?? [];
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
    let learning_curve_file: string = '';
    let cv_scores_file: string = '';

    const get_pretrained_file = async () => {
        let pretrained_file = await $current_pretrained_file;
        if (pretrained_file.endsWith('.pkl')) {
            pretrained_file = pretrained_file.replace('.pkl', '');
        }

        datfile = pretrained_file + '.dat.json';
        resultsfile = pretrained_file + '.results.json';
        learning_curve_file = pretrained_file + '.learning_curve.json';
        cv_scores_file = pretrained_file + '.cv_scores.json';
    };

    $: if ($model) get_pretrained_file();
    $: if (plot_data_ready && data_file) {
        // plot_from_datfile();
        on_plot_data_ready(data_file);
    }

    const plot_from_datfile = async () => {
        await get_pretrained_file();
        await on_plot_data_ready(datfile);
        console.log('Reading results file', resultsfile);

        const parsed_results = await readJSON<MLResults>(resultsfile);
        if (!parsed_results) return;

        console.log(parsed_results);

        $results[$model] = parsed_results;
        await get_learning_curve_data(learning_curve_file);
        await get_cv_scores(cv_scores_file);
    };

    const get_cv_scores = async (filename: string) => {
        const cv_scores_data = await readJSON<Record<string, CVScoresData>>(filename);
        if (!cv_scores_data) return;
        const nfolds = Object.keys(cv_scores_data).map(Number);
        if (!nfolds.length) return;

        const max_nfold = Math.max(...nfolds);
        // console.log({ cv_scores_data, max_nfold });
        if (!$results?.[$model]) return;
        $results[$model].cv_fold = max_nfold;
        $results[$model].cv_scores = cv_scores_data[`${max_nfold}`];
    };

    const get_learning_curve_data = async (filename: string) => {
        const learningCurveData = await readJSON<LearningCurveData>(filename);
        if (!learningCurveData) return;

        // Prepare the data for plotting
        let trainingSizes = Object.keys(learningCurveData);

        const testScores = trainingSizes.map(size => learningCurveData[size].test.mean);
        const testStd = trainingSizes.map(size => learningCurveData[size].test.std);
        const trainScores = trainingSizes.map(size => learningCurveData[size].train.mean);
        const trainStd = trainingSizes.map(size => learningCurveData[size].train.std);
        const Nfold_CV = learningCurveData[trainingSizes[0]].test.scores.length;

        const x = trainingSizes.map(Number);
        // Create traces for test and train scores with error bars
        const testTrace: Partial<Plotly.Data> = {
            x,
            y: testScores,
            error_y: {
                type: 'data',
                array: testStd,
                visible: true,
            },
            mode: 'lines+markers',
            name: 'Test',
            type: 'scatter',
        };

        const trainTrace: Partial<Plotly.Data> = {
            x,
            y: trainScores,
            error_y: {
                type: 'data',
                array: trainStd,
                visible: true,
            },
            mode: 'lines+markers',
            name: 'Train',
            type: 'scatter',
        };

        // Define the layout
        const layout: Partial<Plotly.Layout> = {
            title: 'Learning Curve',
            xaxis: {
                title: 'Training Data Size',
                tickmode: 'array',
                tickvals: x,
            },
            yaxis: {
                title: `R<sup>2</sup> - Score (${Nfold_CV}-fold CV)`,
            },
        };

        const learning_curve_plotly_data = { data: [trainTrace, testTrace], layout };
        if (!$results[$model]) return;
        $results[$model].learning_curve_plotly_data = learning_curve_plotly_data;

        return learning_curve_plotly_data;
    };

    let significant_digits = 2;
    $: if (significant_digits < 0) significant_digits = 0;
    $: if (significant_digits > 10) significant_digits = 10;
</script>

<CustomPanel open={true} title="Results - {$model.toLocaleUpperCase()} Regressor">
    {#key plot_data_ready}
        <!-- {#await $current_pretrained_file then _pretrained_file}
            {@const pretrained_file = _pretrained_file.replace('.pkl', '')}
            {@const _datfile = pretrained_file + '.dat.json'} -->
        {#await fs.exists(datfile) then file_exists}
            {#if file_exists}
                <div class="grid grid-cols-[4fr_1fr] items-center gap-4">
                    <div class="alert alert-success">
                        <CheckCheck />
                        <span>Locally saved computed results are available to plot</span>
                    </div>
                    <button class="btn btn-outline" on:click={plot_from_datfile}>Plot</button>
                </div>
            {/if}
        {/await}
        <!-- {/await} -->
    {/key}
    <div class="flex my-2 gap-4 items-end">
        <Checkbox
            bind:value={$include_training_file_in_plot}
            label="Plot training data"
            on:change={include_training_plot_if_required}
        />

        <CustomInput bind:value={significant_digits} label="significant_digits" type="number" min="0" max="10" />
    </div>
    <ResultsStats {significant_digits} />
</CustomPanel>
