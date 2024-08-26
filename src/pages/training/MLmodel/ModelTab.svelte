<script lang="ts">
    import { model } from './stores';
    import supervised_ml_models from '$lib/config/ml_model/ml_models_parameters';
</script>

<div role="tablist" class="tabs tabs-bordered gap-1">
    {#each Object.keys(supervised_ml_models) as tab (tab)}
        <button
            role="tab"
            class="tab border border-b-2 hvr-glow hover:border-rounded"
            class:border-b-solid={$model === tab}
            class:border-rounded={$model === tab}
            class:tab-active={$model === tab}
            on:click={() => ($model = tab)}
        >
            {tab.toLocaleUpperCase()}
        </button>
    {/each}
</div>
