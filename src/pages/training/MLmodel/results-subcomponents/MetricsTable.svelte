<script lang="ts">
    import { current_model_pkl_files, cv_fold, model } from '../stores';
    const columns = ['Mode', 'Embedder', 'R<sup>2</sup>', 'MSE', 'RMSE', 'MAE'];

    function roundToUncertainty(value: number, uncertainty: number) {
        // Find the decimal place of the most significant digit in uncertainty
        const decimalPlace = -Math.floor(Math.log10(uncertainty));

        // Round both value and uncertainty to the same decimal place
        const roundedValue = value.toFixed(decimalPlace);
        const roundedUncertainty = Number(uncertainty.toFixed(decimalPlace));

        // Format the result string
        const formattedValue = `${roundedValue} (${roundedUncertainty})`;

        return formattedValue;
    }

    const read_all_pkl_files = async (
        filelist: Record<
            string,
            {
                name: string;
                pkl_file: string;
            }[]
        >,
    ) => {
        if (isEmpty(filelist)) return;
        console.log('Reading all pkl files', filelist);

        for (const embedder in filelist) {
            const modes = filelist[embedder];
            console.log(embedder, modes);
            for (const { name, pkl_file } of modes) {
                const cv_scores_file = pkl_file.replace('.pkl', '.cv_scores.json');
                if (!(await fs.exists(cv_scores_file))) {
                    console.error(`File not found: ${cv_scores_file}`);
                    return;
                }
                const fname = await path.basename(pkl_file);
                console.log(embedder, name, fname);
                const cv_fname = await path.basename(cv_scores_file);
                console.log('CV Scores file exists:', cv_fname);

                const contents = await readJSON<Record<string, CVScoresData>>(cv_scores_file);
                if (!contents) return;
                const stats = contents[`${$cv_fold}`];
                const r2 = roundToUncertainty(stats.test.r2.mean, stats.test.r2.std);
                const mse = roundToUncertainty(stats.test.mse.mean, stats.test.mse.std);
                const rmse = roundToUncertainty(stats.test.rmse.mean, stats.test.rmse.std);
                const mae = roundToUncertainty(stats.test.mae.mean, stats.test.mae.std);

                // let mode = name;
                if (!best_metric_mae) {
                    best_metric_mae = stats.test.mae.mean;
                    best_metric_row = metric_rows.length;
                } else if (stats.test.mae.mean < best_metric_mae) {
                    best_metric_mae = stats.test.mae.mean;
                    best_metric_row = metric_rows.length;
                }

                metric_rows = [...metric_rows, [name, embedder, r2, mse, rmse, mae]];
                console.log(r2, stats.test.r2.mean, stats.test.r2.std);
            }
        }
    };

    let best_metric_row = 0;
    let best_metric_mae: number | undefined = undefined;
    let metric_rows: string[][] = [];

    $: read_all_pkl_files($current_model_pkl_files);
</script>

<div class="overflow-x-auto" style="height: 500px;">
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
                <tr class="hover:bg-base-200" class:bg-success={best_metric_row === index}>
                    <th>{index}</th>
                    {#each mrow as val, i ([...mrow, i, index])}
                        <td class="select-text">{val}</td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>
