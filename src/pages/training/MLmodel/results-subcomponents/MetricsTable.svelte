<script lang="ts">
    import { Loadingbtn } from '$lib/components';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { ROOT_DIR } from '$pages/training/training_file/plot-analysis/stores';
    import { current_model_pkl_files, cv_fold, model } from '../stores';

    const columns = ['Mode', 'Embedder', 'Data shape', 'R2', 'MSE', 'RMSE', 'MAE'];

    let best_metric_choice: CV_scoring_methods = 'mae';
    let file_read = false;

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

        file_read = false;
        metric_rows = [];

        for (const embedder in filelist) {
            const modes = filelist[embedder];
            for (const { name, pkl_file } of modes) {
                const cv_scores_file = pkl_file.replace('.pkl', '.cv_scores.json');
                const results_file = pkl_file.replace('.pkl', '.results.json');
                if (!(await fs.exists(cv_scores_file))) {
                    console.error(`File not found: ${cv_scores_file}`);
                    return;
                }

                const contents = await readJSON<Record<string, CVScoresData>>(cv_scores_file);
                if (!contents) return;
                const stats = contents[`${cv_fold}`];

                const results_contents = await readJSON<Record<string, any>>(results_file);
                const data_shapes = results_contents?.data_shapes;
                let X_data_shape = data_shapes.X ? `${data_shapes.X[0]} x ${data_shapes.X[1]}` : 'N/A';

                // use sigfig_value from computed file
                if (!('sigfig_value' in stats.test.r2)) {
                    metric_rows = [...metric_rows, [name, embedder, X_data_shape, 'N/A', 'N/A', 'N/A', 'N/A']];
                    continue;
                }

                const r2 = stats.test.r2.sigfig_value ?? 'N/A';
                const mse = stats.test.mse.sigfig_value ?? 'N/A';
                const rmse = stats.test.rmse.sigfig_value ?? 'N/A';
                const mae = stats.test.mae.sigfig_value ?? 'N/A';

                metric_rows = [...metric_rows, [name, embedder, X_data_shape, r2, mse, rmse, mae]];
            }
        }
        file_read = true;
    };

    function extractValueAndStd(str: string): { value: number | null; std: number | null } {
        const regex = /^(-?\d*\.?\d+)\s*\((-?\d*\.?\d+)\)$/;
        const match = str.match(regex);

        return {
            value: match ? parseFloat(match[1]) : null,
            std: match ? parseFloat(match[2]) : null,
        };
    }

    const compute_metric = (file_read: boolean) => {
        if (!(file_read && best_metric_choice && metric_rows.length > 0)) return;
        console.warn('computing metric');
        let best_metric_val: number | undefined = undefined;
        let best_metric_std: number | undefined = undefined;

        best_metric_row = -1;

        metric_rows.forEach((row, ind) => {
            const { value: r2, std: r2_std } = extractValueAndStd(row[3]);
            const { value: mse, std: mse_std } = extractValueAndStd(row[4]);
            const { value: rmse, std: rmse_std } = extractValueAndStd(row[5]);
            const { value: mae, std: mae_std } = extractValueAndStd(row[6]);

            const metrics = {
                r2: { mean: r2, std: r2_std },
                mse: { mean: mse, std: mse_std },
                rmse: { mean: rmse, std: rmse_std },
                mae: { mean: mae, std: mae_std },
            } as const;

            const metric_val = metrics[best_metric_choice].mean;
            const metric_std = metrics[best_metric_choice].std;

            if (!(metric_val && metric_std)) return;

            if (!(best_metric_val && best_metric_std)) {
                best_metric_val = metric_val;
                best_metric_std = metric_std;
                best_metric_row = ind;
            }

            if (best_metric_choice === 'r2') {
                if (metric_val > best_metric_val) {
                    best_metric_val = metric_val;
                    best_metric_std = metric_std;
                    best_metric_row = ind;
                } else if (metric_val === best_metric_val) {
                    if (metric_std < best_metric_std) {
                        best_metric_val = metric_val;
                        best_metric_std = metric_std;
                        best_metric_row = ind;
                    }
                }
            } else {
                if (metric_val < best_metric_val) {
                    best_metric_val = metric_val;
                    best_metric_std = metric_std;
                    best_metric_row = ind;
                } else if (metric_val === best_metric_val) {
                    if (metric_std < best_metric_std) {
                        best_metric_val = metric_val;
                        best_metric_std = metric_std;
                        best_metric_row = ind;
                    }
                }
            }
        });
        // console.log('best_metric_row', best_metric_row);
    };

    let best_metric_row = -1;
    let metric_rows: string[][] = [];

    $: read_all_pkl_files($current_model_pkl_files, $cv_fold);
    $: compute_metric(file_read);

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

<div class="flex-gap items-end">
    <CustomSelect
        label="Best metric"
        bind:value={best_metric_choice}
        items={['r2', 'mse', 'rmse', 'mae']}
        on:change={() => compute_metric(file_read)}
    />

    <button class="btn btn-sm btn-outline" on:click={async () => await export_to_csv()}>Export (.csv)</button>

    <Loadingbtn
        name="Export all models (.csv)"
        callback={async () => {
            return {
                pyfile: 'training.export_all_metrics',
                args: {
                    metrics_loc: await path.join($ROOT_DIR, 'metrics'),
                },
            };
        }}
    />
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
