<script lang="ts">
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import Predictions from './Predictions.svelte';
    import Analysis from './Analysis.svelte';
    export let id: string = 'ml-predictions';
    export let display: string = 'none';
    let active_tab = 'Predictions';
</script>

<div class="grid content-start gap-2" {id} style:display>
    <div class="w-max">
        <TabBar tabs={['Predictions', 'Analysis']} let:tab bind:active={active_tab}>
            <Tab {tab}>
                <Label>{tab}</Label>
            </Tab>
        </TabBar>
    </div>
    {#if active_tab === 'Predictions'}
        <Predictions />
    {:else if active_tab === 'Analysis'}
        <Analysis />
    {/if}
</div>
