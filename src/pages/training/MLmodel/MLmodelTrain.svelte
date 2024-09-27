<script lang="ts">
    import {
        model,
        hyperparameters,
        parameters,
        fine_tune_model,
        variable_type,
        cv_fold,
        bootstrap_nsamples,
        noise_percentage,
        results,
        cross_validation,
        bootstrap,
        test_size,
        save_pretrained_model,
        grid_search_method,
        randomzied_gridsearch_niter,
        halving_factor,
        parallel_computation,
        n_jobs,
        parallel_computation_backend,
        default_parameter_mode,
        skip_invalid_y_values,
        current_pretrained_file,
        ytransformation,
        yscaling,
        inverse_scaling,
        inverse_transform,
        all_params_lock_status,
        fine_tuned_values,
        learning_curve,
        analyse_shapley_values,
        plot_data,
    } from './stores';
    import { embedding, use_PCA } from '../embedding/stores';
    import { NPARTITIONS, use_dask } from '$lib/stores/system';
    import { embedd_savefile_path } from '../embedding/stores';
    import { Loadingbtn } from '$lib/components';
    import Accordion from '@smui-extra/accordion';
    import {
        loaded_df_columns,
        training_column_name_X,
        training_column_name_y,
        training_file,
    } from '../training_file/stores';
    import TrainingFilePanel from './TrainingFilePanel.svelte';
    import ControlPanel from './ControlPanel.svelte';
    import ModelPanel from './ModelPanel.svelte';
    import MoreOptionsPanel from './MoreOptionsPanel.svelte';
    import SaveModelPanel from './SaveModelPanel.svelte';
    import ResultsPanel from './ResultsPanel.svelte';
    import Effects from './Effects.svelte';
    import { difference } from 'lodash-es';
    import { current_training_data_file } from '../training_file/plot-analysis/stores';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    const unique_id = getID();
    setContext('unique_id', unique_id);

    const fit_function = async () => {
        if (!$loaded_df_columns.includes($training_column_name_X)) {
            toast.error('Column X not found in the loaded file. Please select a valid column name.');
            return;
        }

        if (!$loaded_df_columns.includes($training_column_name_y)) {
            toast.error('Column y not found in the loaded file. Please select a valid column name.');
            return;
        }

        const final_training_file = await $current_training_data_file;
        const vectors_file = await $embedd_savefile_path;

        console.log({ vectors_file, final_training_file });
        if (!(await fs.exists(final_training_file))) {
            toast.error('Error: Training file not found');
            return;
        }

        if (!(await fs.exists(vectors_file))) {
            toast.error('Error: Embeddings vector file not found');
            return;
        }

        if (!$training_column_name_y) {
            toast.error('Error: Column Y not provided. Set it in the training file');
            return;
        }

        let clonedFineTunedValues: Record<string, any> = {};

        if ($fine_tune_model) {
            if (!$fine_tuned_values[$model]) {
                toast.error('Error: Fine tuned hyperparameters not found');
                return;
            }
            const v = ['hyperparameters', 'parameters'] as const;
            v.forEach(key => {
                const cloned_obj = structuredClone($fine_tuned_values[$model][key]);
                Object.keys(cloned_obj).forEach(label => {
                    if ($all_params_lock_status[$model][key][label]) return;
                    if (!cloned_obj[label]) return;
                    clonedFineTunedValues[label] = cloned_obj[label].split(',').map(f => {
                        f = f.trim();
                        try {
                            if (f === 'true' || f === 'false' || f === 'null') return JSON.parse(f);
                            if (f === 'None') return null;
                            if (!isNaN(Number(f))) return Number(f);
                            return f;
                        } catch (error) {
                            console.error('Error parsing', f, error);
                        }
                    });
                    console.log(label, cloned_obj[label], clonedFineTunedValues[label]);
                });
            });
            console.log('fine tuned values', clonedFineTunedValues);
            if (isEmpty(clonedFineTunedValues)) {
                toast.error('Error: Fine tuned hyperparameters not found');
                return;
            }
        }

        const pre_trained_file = await $current_pretrained_file;
        console.log({ pre_trained_file });
        if (await fs.exists(pre_trained_file)) {
            const overwrite = await dialog.confirm(
                pre_trained_file + ': Pre trained model file already exists. Do you want to overwrite it?',
                'Overwrite file',
            );
            if (!overwrite) return;
        }

        const values = structuredClone({ ...$hyperparameters[$model], ...$parameters[$model] });

        Object.keys($all_params_lock_status[$model].parameters).forEach(params => {
            if (params in clonedFineTunedValues && clonedFineTunedValues[params] !== null) {
                delete values[params];
                return;
            }

            const locked = $all_params_lock_status[$model].parameters[params];
            if (!locked) return;
            delete values[params];
        });

        Object.keys($all_params_lock_status[$model].hyperparameters).forEach(hparams => {
            if (hparams in clonedFineTunedValues && clonedFineTunedValues[hparams] !== null) {
                delete values[hparams];
                return;
            }

            const locked = $all_params_lock_status[$model].hyperparameters[hparams];
            if (!locked) return;
            delete values[hparams];
        });

        let clonedValues: Record<string, string | boolean | number | null> = {};
        // console.log({ values, $variable_type });

        Object.entries(values).forEach(([key, value], ind) => {
            // console.log(ind, { key, value, type: $variable_type[key] });

            if (typeof value === 'string' && $variable_type[key] === 'str' && value !== 'float') {
                clonedValues[key] = value?.trim() || null;
                return;
            }

            if (value === 'float') {
                const input = document.getElementById(`${unique_id}_${key}`) as HTMLInputElement;
                if (!input) {
                    toast.error(`Error: ${key} input not found`);
                    return;
                }
                const val = parseFloat(input.value);
                if (isNaN(val)) {
                    toast.error(`Error: ${key} input is not a number. Please enter a valid number`);
                    return;
                }
                clonedValues[key] = val;
            }

            if (typeof value !== 'string') {
                if (value === undefined) {
                    clonedValues[key] = null;
                    return;
                }
                clonedValues[key] = value;
                return;
            }

            if (!isNaN(Number(value))) {
                if ($variable_type[key] === 'float') clonedValues[key] = parseFloat(value);
                else if ($variable_type[key] === 'integer') clonedValues[key] = parseInt(value);
            }
        });

        const grid_search_parameters = {
            n_iter: Number($randomzied_gridsearch_niter),
            factor: Number($halving_factor),
        };
        console.warn({ clonedValues, fine_tuned_values: $fine_tuned_values[$model], clonedFineTunedValues });

        let learning_curve_train_sizes = null;
        if ($learning_curve.active) {
            if ($learning_curve.train_sizes === '') {
                toast.error('Error: Learning curve train sizes not provided');
                return;
            }
            learning_curve_train_sizes = $learning_curve.train_sizes.split(',').map(f => Number(f));
            console.log({ learning_curve_train_sizes });
            if (learning_curve_train_sizes.length !== 3) {
                toast.error('Error: Learning curve train sizes must be 3 values');
                return;
            }

            if (learning_curve_train_sizes.some(f => isNaN(f))) {
                toast.error('Error: Learning curve train sizes must be numbers');
                return;
            }

            if (learning_curve_train_sizes.slice(0, -1).some(f => f <= 0 || f > 1)) {
                toast.error('Error: Learning curve train sizes must be between 0 and 1');
                return;
            }
        }

        const args = {
            model: $model,
            vectors_file,
            training_file: {
                key: $training_file.key,
                filetype: $training_file.filetype,
                filename: final_training_file,
            },
            training_column_name_y: $training_column_name_y,
            parameters: $default_parameter_mode ? {} : clonedValues,
            fine_tuned_values: $default_parameter_mode ? {} : clonedFineTunedValues,
            fine_tune_model: $fine_tune_model && !$default_parameter_mode && !isEmpty(clonedFineTunedValues),
            bootstrap: $bootstrap,
            bootstrap_nsamples: Number($bootstrap_nsamples),
            noise_percentage: Number($noise_percentage),
            cross_validation: $cross_validation,
            cv_fold: Number($cv_fold),
            test_size: Number($test_size) / 100,
            grid_search_method: $grid_search_method,
            grid_search_parameters,
            pre_trained_file,
            npartitions: Number($NPARTITIONS),
            ytransformation: $ytransformation === 'None' ? null : $ytransformation,
            yscaling: $yscaling === 'None' ? null : $yscaling,
            embedding: $embedding,
            pca: $use_PCA,
            save_pretrained_model: $save_pretrained_model,
            parallel_computation: $parallel_computation,
            n_jobs: Number($n_jobs),
            parallel_computation_backend: $parallel_computation_backend,
            use_dask: $use_dask,
            skip_invalid_y_values: $skip_invalid_y_values,
            inverse_scaling: $inverse_scaling,
            inverse_transform: $inverse_transform,
            learning_curve_train_sizes,
            analyse_shapley_values: $analyse_shapley_values,
        };

        $results[$model] = null;
        // $plot_data[$model] = null;
        // console.warn(args);
        // return;
        return { pyfile: 'training.ml_model', args };
    };

    let plot_data_ready = false;
    let data_file = '';

    const onResult = async (e: CustomEvent) => {
        plot_data_ready = false;
        const { args } = e.detail;
        console.log('Training completed');

        const result_file = args.pre_trained_file + '.results.json';

        console.log('Pre-trained file', result_file);
        if (await fs.exists(result_file)) {
            toast.success('Model trained successfully');
            try {
                const saved_file_contents = await fs.readTextFile(result_file);
                $results[$model] = JSON.parse(saved_file_contents);
                if (!$results[$model]) {
                    toast.error('Error: Results not found');
                    return;
                }
            } catch (error) {
                toast.error('Error saving results\n' + error);
            }
        } else {
            toast.error('Error: Model not saved');
        }
        data_file = args.pre_trained_file + '.dat.json';
        if (await fs.exists(data_file)) {
            plot_data_ready = true;
            toast.success('Model trained successfully');
        } else {
            toast.error('Error: Model not saved');
        }
    };
</script>

<div {id} style:display class="grid content-start gap-2">
    <Effects />
    <div class="overflow-auto md:max-h-[75vh] sm:max-h-lg p-2">
        <Accordion multiple>
            <TrainingFilePanel />
            <ControlPanel />
            <ModelPanel />
            <MoreOptionsPanel />
            <SaveModelPanel />
            <ResultsPanel {plot_data_ready} {data_file} />
        </Accordion>
    </div>
    <Loadingbtn class="m-auto " name="Begin training" callback={fit_function} subprocess={true} on:result={onResult} />
</div>
