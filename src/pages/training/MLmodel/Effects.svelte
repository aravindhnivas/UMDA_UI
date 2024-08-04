<script lang="ts">
    import {
        current_model,
        default_param_values,
        fine_tuned_hyperparameters,
        hyperparameters,
        model,
        parameters,
        pre_trained_filename,
    } from './stores';

    import { embedding, use_PCA } from '../embedding/stores';

    const set_model_params = () => {
        console.log('Setting model params', $current_model, $model);
        if (!$model) return;
        if (!$current_model) return;

        console.log({ $hyperparameters, $parameters });
        console.log(Object.keys({ ...$hyperparameters?.[$model], ...$parameters?.[$model] }).length);
        // Set the default values if they don't exist
        $hyperparameters[$model] ??= structuredClone($default_param_values.hyperparameters);
        $parameters[$model] ??= structuredClone($default_param_values.parameters);

        // setting fine tuned hyperparameters
        $fine_tuned_hyperparameters[$model] ??= {};
        Object.keys($current_model.hyperparameters).forEach(f => {
            $fine_tuned_hyperparameters[$model][f] ??= structuredClone($current_model.hyperparameters[f].fine_tune);
        });
        console.log({ $hyperparameters, $parameters });
        console.log(Object.keys({ ...$hyperparameters[$model], ...$parameters[$model] }).length);
        console.log('fine tuned hyperparameters values', $fine_tuned_hyperparameters);

        // Set the pre-trained model filename
        $pre_trained_filename = `${$model}_pretrained_model`;
    };

    onMount(() => {
        set_model_params();
    });

    $: if ($model) set_model_params();
</script>
