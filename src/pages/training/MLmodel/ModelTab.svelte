<script lang="ts">
    import { model } from './stores';
    import supervised_ml_models from '$lib/config/ml_model/ml_models_parameters';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
</script>

<!-- <TabBar class="overflow-auto" tabs={Object.keys(supervised_ml_models)} let:tab bind:active={$model}>
    <Tab {tab} minWidth>
        <Label><span class="text-black">{tab}</span></Label>
    </Tab>
</TabBar> -->

<div role="tablist" class="tabs tabs-bordered gap-1">
    {#each Object.keys(supervised_ml_models) as tab (tab)}
        <!-- svelte-ignore a11y-interactive-supports-focus -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            role="tab"
            class="tab border border-b-2 hvr-glow hover:border-rounded"
            class:border-b-solid={$model === tab}
            class:border-rounded={$model === tab}
            class:tab-active={$model === tab}
            on:click={() => ($model = tab)}
        >
            {tab.toLocaleUpperCase()}
        </div>
    {/each}
</div>
