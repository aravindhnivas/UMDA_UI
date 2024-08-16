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
    <div class="grid gap-2" class:hidden={active_tab !== 'Predictions'}>
        <Predictions />
    </div>
    <div class="grid gap-2" class:hidden={active_tab !== 'Analysis'}>
        <Analysis />
    </div>
</div>
