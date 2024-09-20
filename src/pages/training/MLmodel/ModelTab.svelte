<script lang="ts">
    import { model } from './stores';
    import supervised_ml_models from '$lib/config/ml_model/ml_models_parameters';
    import { typeSafeObjectKeys } from '$lib/utils';
</script>

<div role="tablist" class="tabs tabs-bordered flex flex-wrap">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-missing-attribute -->
    {#each typeSafeObjectKeys(supervised_ml_models) as tab (tab)}
        <!-- svelte-ignore a11y-interactive-supports-focus -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <a role="tab" class="tab" class:tab-active={$model === tab} on:click={() => ($model = tab)}>
            {tab.toLocaleUpperCase()}
        </a>
    {/each}
</div>
