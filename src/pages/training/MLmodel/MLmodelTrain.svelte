<script lang="ts">
    import CustomSelect from '$lib/components/CustomSelect.svelte';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    let model = 'linear_regression';
    const supervised_models = [
        'linear_regression',
        'ridge_regression',
        'bayesian_ridge',
        'support_vector_regression',
        'knn',
        'random_forest',
        'gradient_boosting',
        'gaussian_process',
    ];
</script>

<div class="grid content-start gap-2" {id} style:display>
    <div class="flex">
        <CustomSelect label="Supervised Learning Algorithms" bind:value={model} items={supervised_models} />
    </div>
</div>
