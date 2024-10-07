<script lang="ts">
    import { embedd_savefile } from '../embedding/stores';
    import {
        current_model,
        default_fine_tuned_values,
        default_param_values,
        fine_tuned_values,
        hyperparameters,
        model,
        parameters,
        pre_trained_filename,
    } from './stores';
    import { set_default_fine_tuned_values } from './utils';

    const set_fine_tuned_values = (key: 'hyperparameters' | 'parameters') => {
        const cloned_obj = structuredClone($current_model[key]);
        console.log({ $current_model });
        console.log('Setting fine tuned values', $model, key, cloned_obj);
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
    const set_model_params = () => {
        // console.log('Setting model params', $current_model, $model);
        if (!$model) return;
        if (!$current_model) return;

        // Set the default values if they don't exist
        $hyperparameters[$model] ??= structuredClone($default_param_values.hyperparameters);
        $parameters[$model] ??= structuredClone($default_param_values.parameters);
        $default_fine_tuned_values[$model] ??= { hyperparameters: {}, parameters: {} };

        Object.keys($current_model.optuna_grid).forEach(okey => {
            console.log('Setting default fine tuned values', $model, okey);

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
            console.log({ hparams_keys, params_keys, okey });
            if (hparams_keys.includes(okey)) {
                $default_fine_tuned_values[$model].hyperparameters[okey] = { value, type, scale, active: false };
            } else if (params_keys.includes(okey)) {
                $default_fine_tuned_values[$model].parameters[okey] = { value, type, scale, active: false };
            }
        });
        console.log($default_fine_tuned_values?.[$model]);

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
        $pre_trained_filename = `${$model}_${$embedd_savefile}_pretrained_model`;
    };

    onMount(() => {
        set_model_params();
    });

    $: if ($model || $embedd_savefile) set_model_params();
</script>
