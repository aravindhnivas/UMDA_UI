<script lang="ts">
    import AnalysisData from './AnalysisData.svelte';
    import LoadData from './LoadData.svelte';
    import CustomTabs from '$lib/components/CustomTabs.svelte';
    import { Binary, ChartCandlestick } from 'lucide-svelte/icons';

    export let id: string = 'training-file-container';
    export let display: string = 'none';

    const tabs = [
        { tab: 'Load data', component: Binary },
        { tab: 'Analyse data', component: ChartCandlestick },
    ];

    let active_tab = 'Load data';
</script>

<div class="grid content-start gap-4" {id} style:display>
    <CustomTabs {tabs} bind:active={active_tab} />
    <div class="grid gap-2" class:hidden={active_tab !== 'Load data'}>
        <LoadData />
    </div>
    <div class="grid gap-2" class:hidden={active_tab !== 'Analyse data'}>
        <AnalysisData />
    </div>
</div>
