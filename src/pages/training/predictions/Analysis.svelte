<script lang="ts">
    import Plot from 'svelte-plotly.js';
    import FileLoader from '$lib/components/fileloader/FileLoader.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';

    const analysis_test_file_for_prediction = localWritable('analysis_test_file_for_prediction', {
        filename: '',
        filetype: 'csv',
        key: 'data',
    });

    let columnX = '';
    let columnY = '';
    let columns: string[] = [];

    let data: Partial<Plotly.PlotData>[] = [];
    let use_dask = false;

    const PredictionAnalysis = async () => {
        if (!columnX || !columnY) {
            toast.error('Please select columns');
            return;
        }

        return {
            pyfile: 'training.ml_prediction_analysis',
            args: {
                analysis_file: $analysis_test_file_for_prediction,
                columnX,
                columnY,
                use_dask,
            },
        };
    };

    interface DataType {
        y_pred: number[];
        y_true: number[];
        y_fit: number[];
        r2: number;
        mse: number;
        mae: number;
        rmse: number;
        computed_time: string;
    }

    let data_from_python: DataType;

    const onResult = (e: CustomEvent) => {
        if (!e.detail) return;
        const { dataFromPython } = e.detail as { dataFromPython: DataType };
        if (!dataFromPython) return;

        data_from_python = dataFromPython;

        data = [
            {
                x: dataFromPython.y_true,
                y: dataFromPython.y_pred,
                mode: 'markers',
                type: 'scatter',
                name: 'Predicted vs True',
            },
            {
                x: dataFromPython.y_true,
                y: dataFromPython.y_fit,
                mode: 'lines',
                type: 'scatter',
                name: 'Fit line',
            },
        ];
    };
</script>

<FileLoader
    bind:filename={$analysis_test_file_for_prediction['filename']}
    bind:filetype={$analysis_test_file_for_prediction['filetype']}
    filetypes={['csv', 'smi', 'txt']}
    on:load={e => {
        if (!e.detail) return;
        console.log(e.detail);
        if (!e.detail.columns) return;
        columns = e.detail.columns;
    }}
    bind:use_dask
/>

<div class="flex gap-2 items-end">
    <CustomSelect label="True - X" bind:value={columnX} items={columns} />
    <CustomSelect label="Predicted - Y" bind:value={columnY} items={columns} />
    <Loadingbtn name="Plot" callback={PredictionAnalysis} on:result={onResult} />
</div>

{#if data_from_python}
    <div class="flex gap-2">
        <span class="badge">R<sup>2</sup>: {data_from_python.r2.toFixed(2)}</span>
        <span class="badge">MSE: {data_from_python.mse.toFixed(2)}</span>
        <span class="badge">RMSE: {data_from_python.rmse.toFixed(2)}</span>
        <span class="badge">MAE: {data_from_python.mae.toFixed(2)}</span>
    </div>
{/if}

<div style="height: 500px;">
    <Plot
        {data}
        layout={{
            xaxis: { title: 'True value' },
            yaxis: { title: 'Predicted value' },
            margin: { t: 0 },
        }}
        fillParent={true}
        debounce={250}
    />
</div>
