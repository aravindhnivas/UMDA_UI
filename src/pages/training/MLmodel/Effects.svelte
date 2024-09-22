<script lang="ts">
    // import { range } from 'lodash-es';
    import { embedd_savefile } from '../embedding/stores';
    import {
        current_model,
        default_param_values,
        fine_tuned_hyperparameters,
        hyperparameters,
        model,
        parameters,
        pre_trained_filename,
    } from './stores';

    // import { embedding, use_PCA } from '../embedding/stores';

    const set_model_params = () => {
        // console.log('Setting model params', $current_model, $model);
        if (!$model) return;
        if (!$current_model) return;

        // Set the default values if they don't exist
        $hyperparameters[$model] ??= structuredClone($default_param_values.hyperparameters);
        $parameters[$model] ??= structuredClone($default_param_values.parameters);

        // setting fine tuned hyperparameters
        $fine_tuned_hyperparameters[$model] ??= {};
        const cloned_obj = structuredClone({ ...$current_model.hyperparameters, ...$current_model.parameters });
        Object.keys(cloned_obj).forEach((label, ind) => {
            const obj = cloned_obj[label];
            let fine_tune_options = '';
            if (isObject(obj.value)) {
                let opts = Object.keys(obj.value.options);
                if (opts.includes('float')) {
                    opts = opts.filter(f => f !== 'float');
                    opts.push('10');
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
            $fine_tuned_hyperparameters[$model][label] = fine_tune_options;
        });

        // Set the pre-trained model filename
        $pre_trained_filename = `${$model}_${$embedd_savefile}_pretrained_model`;
    };

    onMount(() => {
        set_model_params();
    });

    $: if ($model || $embedd_savefile) set_model_params();
</script>
