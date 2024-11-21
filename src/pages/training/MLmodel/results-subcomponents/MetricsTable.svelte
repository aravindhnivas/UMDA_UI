<script lang="ts">
    import { ROOT_DIR } from '$pages/training/training_file/plot-analysis/stores';
    import { current_model_pkl_files, cv_fold, model } from '../stores';
    const columns = ['Mode', 'Embedder', 'Data shape', 'R2', 'MSE', 'RMSE', 'MAE'];
    function roundToUncertainty(value: number, uncertainty: number): string {
        // Handle invalid inputs
        if (uncertainty <= 0) {
            throw new Error('Uncertainty must be positive');
        }
        if (typeof value !== 'number' || typeof uncertainty !== 'number') {
            throw new Error('Both value and uncertainty must be numbers');
        }

        // Find the position of the first significant digit in the uncertainty
        const uncertaintyStr = uncertainty.toString();
        let firstSigDigitPos: number;

        if (uncertainty >= 1) {
            // For uncertainties ≥ 1, count digits before decimal point
            firstSigDigitPos = Math.floor(Math.log10(uncertainty));
            // Round to nearest power of 10
            const roundingFactor = Math.pow(10, firstSigDigitPos);
            const roundedValue = Math.round(value / roundingFactor) * roundingFactor;
            // Convert uncertainty to last digit representation
            const uncertaintyInLastDigit = Math.round(uncertainty / roundingFactor);
            return `${roundedValue} (${uncertaintyInLastDigit})`;
        } else {
            // For uncertainties < 1, find first non-zero digit
            const match = uncertaintyStr.match(/[1-9]/);
            if (!match) {
                throw new Error('Invalid uncertainty value');
            }

            const decimalIndex = uncertaintyStr.indexOf('.');
            // Initialize to position before decimal
            firstSigDigitPos = -decimalIndex - 1;

            // If we found a match and it's after the decimal point
            if (match.index !== undefined && match.index > decimalIndex) {
                firstSigDigitPos = -(match.index - decimalIndex);
            }

            // Round both value and uncertainty to appropriate decimal places
            const decimalPlaces = -firstSigDigitPos;
            const roundingFactor = Math.pow(10, decimalPlaces);
            const roundedValue = Math.round(value * roundingFactor) / roundingFactor;
            // Convert uncertainty to last digit representation
            const uncertaintyInLastDigit = Math.round(uncertainty * roundingFactor);

            return `${roundedValue.toFixed(decimalPlaces)} (${uncertaintyInLastDigit})`;
        }
    }
    const read_all_pkl_files = async (
        filelist: Record<
            string,
            {
                name: string;
                pkl_file: string;
            }[]
        >,
        cv_fold = 5,
    ) => {
        if (isEmpty(filelist)) return;
        // console.log('Reading all pkl files', filelist);
        metric_rows = [];
        for (const embedder in filelist) {
            const modes = filelist[embedder];
            // console.log(embedder, modes);
            for (const { name, pkl_file } of modes) {
                const cv_scores_file = pkl_file.replace('.pkl', '.cv_scores.json');
                const results_file = pkl_file.replace('.pkl', '.results.json');
                if (!(await fs.exists(cv_scores_file))) {
                    console.error(`File not found: ${cv_scores_file}`);
                    return;
                }
                // const fname = await path.basename(pkl_file);
                // console.log(embedder, name, fname);
                // const cv_fname = await path.basename(cv_scores_file);
                // console.log('CV Scores file exists:', cv_fname);

                const contents = await readJSON<Record<string, CVScoresData>>(cv_scores_file);
                if (!contents) return;
                const stats = contents[`${cv_fold}`];

                const results_contents = await readJSON<Record<string, any>>(results_file);
                const data_shapes = results_contents?.data_shapes;
                let X_data_shape = data_shapes.X ? `${data_shapes.X[0]} x ${data_shapes.X[1]}` : 'N/A';
                console.log('X_data_shape', X_data_shape);

                // use sigfig_value from computed file
                if (!('sigfig_value' in stats.test.r2)) {
                    metric_rows = [...metric_rows, [name, embedder, X_data_shape, 'N/A', 'N/A', 'N/A', 'N/A']];
                    continue;
                }

                const r2 = stats.test.r2.sigfig_value ?? 'N/A';
                const mse = stats.test.mse.sigfig_value ?? 'N/A';
                const rmse = stats.test.rmse.sigfig_value ?? 'N/A';
                const mae = stats.test.mae.sigfig_value ?? 'N/A';

                // compute uncertainty from std
                // const r2 = roundToUncertainty(stats.test.r2.mean, stats.test.r2.std);
                // const mse = roundToUncertainty(stats.test.mse.mean, stats.test.mse.std);
                // const rmse = roundToUncertainty(stats.test.rmse.mean, stats.test.rmse.std);
                // const mae = roundToUncertainty(stats.test.mae.mean, stats.test.mae.std);

                if (!best_metric_mae) {
                    best_metric_mae = stats.test.mae.mean;
                    best_metric_row = metric_rows.length;
                } else if (stats.test.mae.mean < best_metric_mae) {
                    best_metric_mae = stats.test.mae.mean;
                    best_metric_row = metric_rows.length;
                }

                metric_rows = [...metric_rows, [name, embedder, X_data_shape, r2, mse, rmse, mae]];
            }
        }
    };

    let best_metric_row = 0;
    let best_metric_mae: number | undefined = undefined;
    let metric_rows: string[][] = [];

    $: read_all_pkl_files($current_model_pkl_files, $cv_fold);

    const export_to_csv = async () => {
        const header = columns.join(',');
        const csv = metric_rows.map(row => row.join(',')).join('\n');
        const content = `${header}\n${csv}`;
        const loc = await path.join($ROOT_DIR, 'metrics');
        if (!(await fs.exists(loc))) {
            await fs.mkdir(loc, { recursive: true });
        }
        await fs.writeTextFile(await path.join(loc, `${$model}_metrics.csv`), content);
        toast.success('Metrics exported successfully');
    };
</script>

<div class="flex">
    <button class="btn btn-sm btn-outline" on:click={async () => await export_to_csv()}>Export (.csv)</button>
</div>

<div class="overflow-x-auto w-full" style="height: 500px;">
    <table class="table bg-base-100">
        <thead>
            <tr>
                <th>{$model.toLocaleUpperCase()}</th>
                {#each columns as column}
                    <th>{@html column}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each metric_rows as mrow, index (mrow)}
                {@const best_row = best_metric_row === index}
                <tr class={best_row ? '' : 'hover:bg-base-200'} class:bg-success={best_row}>
                    <th>{index}</th>
                    {#each mrow as val, i ([...mrow, i, index])}
                        <td class="select-text">{val}</td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>
