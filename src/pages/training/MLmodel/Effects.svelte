<script lang="ts">
    import { embedd_savefile } from '../embedding/stores';
    import {
        current_model,
        default_fine_tuned_values,
        default_param_values,
        fine_tuned_values,
        model,
        tune_parameters,
        pre_trained_filename,
        default_parameter_mode,
    } from './stores';
    import { set_default_fine_tuned_values } from './utils';

    const set_fine_tuned_values = (key: 'hyperparameters' | 'parameters') => {
        const cloned_obj = structuredClone($current_model[key]);

        Object.keys(cloned_obj).forEach(label => {
            const obj = cloned_obj[label];
            let fine_tune_options = '';
            if (isObject(obj.value)) {
                let opts = Object.keys(obj.value.options);
                if (opts.includes('float')) {
                    opts = opts.filter(f => f !== 'float');
                }
                fine_tune_options = opts.join(', ');
            } else if (obj.value === null) {
                fine_tune_options = 'null';
            } else if (isBoolean(obj.value)) {
                fine_tune_options = 'true, false';
            } else {
                fine_tune_options = obj.value.toString();
            }
            fine_tune_options = fine_tune_options.trim();
            // remove trailing comma
            if (fine_tune_options.endsWith(',')) fine_tune_options = fine_tune_options.slice(0, -1);
            $fine_tuned_values[$model][key][label] = {
                value: fine_tune_options,
                active: false,
                type: obj.type,
                scale: obj.type === 'string' ? null : 'linear',
            };
        });
    };
    const set_model_params = (model_name: string, embedding_name: string, default_mode: boolean) => {
        if (!$model) return;
        if (!$current_model) return;

        $tune_parameters[$model] ??= structuredClone($default_param_values);
        $default_fine_tuned_values[$model] ??= { hyperparameters: {}, parameters: {} };

        Object.keys($current_model.optuna_grid).forEach(okey => {
            const { type, low, high, step, options, log } = $current_model.optuna_grid[okey];

            let value: string;

            let scale: 'log' | 'linear' = 'linear';
            if (log) scale = 'log';

            if (type === 'string' && options) value = options?.join(', ');
            else if (type === 'bool') value = 'true, false';
            else {
                value = `${low}, ${high}`;
                if (step) value += `, ${step}`;
            }

            const hparams_keys = Object.keys($current_model.hyperparameters);
            const params_keys = Object.keys($current_model.parameters);
            if (hparams_keys.includes(okey)) {
                $default_fine_tuned_values[$model].hyperparameters[okey] = { value, type, scale, active: false };
            } else if (params_keys.includes(okey)) {
                $default_fine_tuned_values[$model].parameters[okey] = { value, type, scale, active: false };
            }
        });

        // setting fine tuned hyperparameters
        $fine_tuned_values[$model] ??= { hyperparameters: {}, parameters: {} };
        if (isEmpty($fine_tuned_values[$model].hyperparameters)) {
            set_fine_tuned_values('hyperparameters');
            set_default_fine_tuned_values('hyperparameters');
        }
        if (isEmpty($fine_tuned_values[$model].parameters)) {
            set_fine_tuned_values('parameters');
            set_default_fine_tuned_values('parameters');
        }

        // Set the pre-trained model filename
        $pre_trained_filename = `${model_name}_${embedding_name}_pretrained_model${default_mode ? '_default' : ''}`;
    };

    $: set_model_params($model, $embedd_savefile, $default_parameter_mode);
</script>
