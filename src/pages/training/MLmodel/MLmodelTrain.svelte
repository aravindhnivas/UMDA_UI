<script lang="ts">
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import supervised_ml_models from '$lib/config/supervised_ml_models.yml';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    let model = 'linear_regression';
    $: current_model = supervised_ml_models[model];
    $: model && console.log(current_model);
</script>

<!-- <pre>{JSON.stringify(supervised_ml_models, null, 2)}</pre> -->
<div class="grid content-start gap-2" {id} style:display>
    <div class="flex">
        <CustomSelect
            label="Supervised Learning Algorithms"
            bind:value={model}
            items={Object.keys(supervised_ml_models)}
        />
    </div>
</div>

<div class="box">
    <pre>
        {JSON.stringify(current_model, null, 4)}
    </pre>
</div>
