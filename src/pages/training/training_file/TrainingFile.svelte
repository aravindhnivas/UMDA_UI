<script lang="ts">
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import AnalysisData from './AnalysisData.svelte';
    import LoadData from './LoadData.svelte';

    export let id: string = 'training-file-container';
    export let display: string = 'none';

    const tab_items = ['load_data', 'analysis_data'] as const;
    let active_tab: (typeof tab_items)[number] = 'load_data';
</script>

<div class="grid content-start gap-2" {id} style:display>
    <div class="w-max">
        <TabBar tabs={[...tab_items]} let:tab bind:active={active_tab}>
            <Tab {tab}>
                <Label>{tab}</Label>
            </Tab>
        </TabBar>
    </div>
    <div class="grid gap-2" class:hidden={active_tab !== 'load_data'}>
        <LoadData />
    </div>
    <div class="grid gap-2" class:hidden={active_tab !== 'analysis_data'}>
        <AnalysisData />
    </div>
</div>
