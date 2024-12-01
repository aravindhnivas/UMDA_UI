<script lang="ts">
    import { Loadingbtn } from '$lib/components';
    import { NPARTITIONS, use_dask } from '$lib/stores/system';
    import Accordion from '@smui-extra/accordion';
    import { copyText } from 'svelte-copy';
    import { embedd_savefile_path, embedding, embeddings, use_PCA } from '../embedding/stores';
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import {
        loaded_df_columns,
        training_column_name_index,
        training_column_name_X,
        training_column_name_y,
        training_file,
    } from '../training_file/stores';
    import ControlPanel from './ControlPanel.svelte';
    import Effects from './Effects.svelte';
    import ModelPanel from './ModelPanel.svelte';
    import MoreOptionsPanel from './MoreOptionsPanel.svelte';
    import Dashboard from '$pages/settings/dashboards/Dashboard.svelte';
    import ResultsPanel from './ResultsPanel.svelte';
    import SaveModelPanel from './SaveModelPanel.svelte';
    import {
        overwrite_model,
        all_params_lock_status,
        analyse_shapley_values,
        bootstrap,
        bootstrap_nsamples,
        cross_validation,
        current_pretrained_file,
        cv_fold,
        default_parameter_mode,
        fine_tune_model,
        fine_tuned_values,
        grid_search_method,
        halving_factor,
        inverse_scaling,
        inverse_transform,
        learning_curve,
        model,
        n_jobs,
        noise_percentage,
        optuna_n_trials,
        optuna_n_warmup_steps,
        optuna_resume_study,
        parallel_computation,
        parallel_computation_backend,
        randomzied_gridsearch_niter,
        results,
        save_pretrained_model,
        skip_invalid_y_values,
        test_size,
        tune_parameters,
        variable_type,
        optuna_storage_file,
        cleanlab,
        seed,
        enable_y_transformation_and_scaling,
        y_transform,
        ytransformation,
        yscaling,
        model_names,
    } from './stores';
    import TrainingFilePanel from './TrainingFilePanel.svelte';
    import { parse_fine_tuned_values } from './utils';
    import { CheckCheck, TriangleAlert } from 'lucide-svelte/icons';
    import Chip, { Set, Text } from '@smui/chips';
    import Scheduler from './Scheduler.svelte';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    const unique_id = getID();

    setContext('unique_id', unique_id);

    const gather_fine_tuned_values = () => {
        let clonedFineTunedValues: Record<string, any> = {};
        if (!$fine_tune_model) return clonedFineTunedValues;

        if ($default_parameter_mode) {
            toast.error('Cannot fine tune model with default parameters');
            return;
        }

        if (!$fine_tuned_values[$model]) {
            toast.error('Error: Fine tuned hyperparameters not found');
            return;
        }
        clonedFineTunedValues = parse_fine_tuned_values();
        console.log('fine tuned values', clonedFineTunedValues);
        if (isEmpty(clonedFineTunedValues)) {
            toast.error('Error: Fine tuned hyperparameters not found');
            return;
        }
        return clonedFineTunedValues;
    };

    const gather_params = (clonedFineTunedValues: Record<string, any>) => {
        const values = structuredClone({
            ...$tune_parameters[$model].hyperparameters,
            ...$tune_parameters[$model].parameters,
        });

        const v = ['hyperparameters', 'parameters'] as const;
        v.forEach(val => {
            Object.keys($all_params_lock_status[$model][val]).forEach(params => {
                // delete values if it is already fine tuned
                if (params in clonedFineTunedValues && clonedFineTunedValues[params] !== null) {
                    delete values[params];
                    return;
                }
                const locked = $all_params_lock_status[$model][val][params];
                if (!locked) return;
                if ($model === 'gpr' && params === 'kernel' && values[params]) return;
                // delete values if it is locked
                delete values[params];
            });
        });
        return values;
    };

    const gather_learning_curve_data = () => {
        if (!$learning_curve.active) return null;
        let learning_curve_train_sizes = null;

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
        return learning_curve_train_sizes;
    };

    const gather_final_params_values = (values: Record<string, string | number | boolean | null>) => {
        let clonedValues: Record<string, string | boolean | number | null> = {};

        Object.entries(values).forEach(([key, value], ind) => {
            if (typeof value === 'string' && $variable_type[key] === 'string' && value !== 'float') {
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

        return clonedValues;
    };

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

        const pre_trained_file = await $current_pretrained_file;
        if (!$overwrite_model && (await fs.exists(pre_trained_file + '.pkl'))) {
            const overwrite = await dialog.confirm(
                pre_trained_file + ': Pre trained model file already exists. Do you want to overwrite it?',
                'Overwrite file',
            );
            if (!overwrite) return;
        }

        let clonedFineTunedValues: Record<string, any> = {};
        let clonedValues: Record<string, string | boolean | number | null> = {};

        if ($fine_tune_model) {
            clonedFineTunedValues = (await gather_fine_tuned_values()) || {};
            if (isEmpty(clonedFineTunedValues)) return;
        }
        const values = gather_params(clonedFineTunedValues);
        clonedValues = gather_final_params_values(values);
        if (!$default_parameter_mode && isEmpty(clonedValues)) {
            toast.error('Please provide hyperparameters or set to default');
            return;
        }

        const learning_curve_train_sizes = gather_learning_curve_data();
        if ($enable_y_transformation_and_scaling && !$y_transform.transformation && !$y_transform.scaling) {
            toast.error('Please select a transformation or scaling method for the target variable');
            return;
        }

        const args = {
            model: $model,
            vectors_file,
            training_file: {
                key: $training_file.key,
                filetype: $training_file.filetype,
                filename: final_training_file,
            },
            optuna_n_trials: isString($optuna_n_trials) ? parseInt($optuna_n_trials) : $optuna_n_trials,
            optuna_n_warmup_steps: isString($optuna_n_warmup_steps)
                ? parseInt($optuna_n_warmup_steps)
                : $optuna_n_warmup_steps,

            parameters: $default_parameter_mode ? {} : clonedValues,
            fine_tuned_values: $default_parameter_mode ? {} : clonedFineTunedValues,
            fine_tune_model: $fine_tune_model,
            bootstrap: $bootstrap,
            bootstrap_nsamples: Number($bootstrap_nsamples),
            noise_percentage: Number($noise_percentage),
            cross_validation: $cross_validation,
            cv_fold: Number($cv_fold),
            test_size: Number($test_size) / 100,
            grid_search_method: $grid_search_method,
            grid_search_parameters: {
                n_iter: Number($randomzied_gridsearch_niter),
                factor: Number($halving_factor),
            },
            pre_trained_file,
            npartitions: Number($NPARTITIONS),
            ytransformation: $y_transform.transformation,
            yscaling: $y_transform.scaling,
            embedding: $embedding,
            pca: $use_PCA,
            save_pretrained_model: $save_pretrained_model,
            parallel_computation: $parallel_computation,
            n_jobs: Number($n_jobs),
            parallel_computation_backend: $parallel_computation_backend,
            use_dask: $use_dask,
            skip_invalid_y_values: $skip_invalid_y_values,
            inverse_scaling: $fine_tune_model ? false : $inverse_scaling,
            inverse_transform: $fine_tune_model ? false : $inverse_transform,
            learning_curve_train_sizes,
            analyse_shapley_values: $analyse_shapley_values,
            optuna_resume_study: $optuna_resume_study,
            optuna_storage_file: await $optuna_storage_file,
            seed: $seed.lock ? null : $seed.value,
            cleanlab: $cleanlab.active ? $cleanlab.model : null,
            clean_only_train_data: $cleanlab.only_train_data,
            index_col: $training_column_name_index,
            training_column_name_y: $training_column_name_y,
            training_column_name_X: $training_column_name_X,
        };

        delete $results[$model];
        $results = $results; // force - make it reactive
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
            const saved_results = await readJSON<MLResults>(result_file);
            if (!saved_results) {
                toast.error('Error: Results not found');
                return;
            }
            $results[$model] = saved_results;
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

    let compute_btn: HTMLButtonElement;
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
    <div class="flex m-auto gap-4">
        <Loadingbtn
            bind:btn={compute_btn}
            name="Begin training"
            callback={fit_function}
            subprocess={true}
            on:result={onResult}
        />
        <button
            class="flex btn btn-sm btn-outline"
            on:click={async () => {
                const data = await fit_function();
                if (!data) return toast.error('Error: No data found');
                const { args } = data;
                copyText(JSON.stringify(args, null, 4));
                toast.success('copied to clipboard');
                // compute_btn.click();
            }}
        >
            Copy training data info
        </button>
        <Dashboard url="http://localhost:8080" name="Optuna-dashboard" />
        <Scheduler {compute_btn} />
    </div>

    {#await $current_pretrained_file then value}
        {@const filename = value + '.pkl'}
        {#await fs.exists(filename) then file_exists}
            {#await path.basename(filename) then basename}
                <span class="flex gap-2 items-center badge badge-success" class:badge-error={!file_exists}>
                    {#if file_exists}
                        <CheckCheck size="15" />
                        <span>{basename}</span>
                    {:else}
                        <TriangleAlert size="15" />
                        <span>{basename}</span>
                    {/if}
                </span>
            {/await}
        {/await}
    {/await}
</div>
