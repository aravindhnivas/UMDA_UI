<script lang="ts">
    import { model } from './stores';
    import supervised_ml_models from '$lib/config/ml_model/ml_models_parameters';
    import CustomTabs from '$lib/components/CustomTabs.svelte';
</script>

<CustomTabs class="bordered" tabs={Object.keys(supervised_ml_models).map(f => ({ tab: f }))} bind:active={$model} />
