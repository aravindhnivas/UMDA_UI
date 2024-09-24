<script lang="ts">
    // import Tab, { Label } from '@smui/tab';
    // import TabBar from '@smui/tab-bar';
    import AnalysisData from './AnalysisData.svelte';
    import LoadData from './LoadData.svelte';
    import CustomTabs from '$lib/components/CustomTabs.svelte';
    import { Binary, ChartCandlestick } from 'lucide-svelte/icons';
    export let id: string = 'training-file-container';
    export let display: string = 'none';

    // const tab_items = ['load_data', 'analysis_data'] as const;
    const tabs = [
        { tab: 'Load data', component: Binary },
        { tab: 'Analyse data', component: ChartCandlestick },
    ];
    let active_tab = 'Load data';
</script>

<div class="grid content-start gap-2" {id} style:display>
    <!-- <div class="w-max">
        <TabBar tabs={[...tab_items]} let:tab bind:active={active_tab}>
            <Tab {tab}>
                <Label>{tab}</Label>
            </Tab>
        </TabBar>
    </div> -->
    <CustomTabs class="bordered" {tabs} bind:active={active_tab} />
    <div class="grid gap-2" class:hidden={active_tab !== 'Load data'}>
        <LoadData />
    </div>
    <div class="grid gap-2" class:hidden={active_tab !== 'Analyse data'}>
        <AnalysisData />
    </div>
</div>
