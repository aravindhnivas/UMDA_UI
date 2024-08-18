<script lang="ts">
    import { active_tab } from './stores';
    import SizeDistributionPlot from './SizeDistributionPlot.svelte';
    import StructuralDistributionPlot from './StructuralDistributionPlot.svelte';
    import ElementalDistributionPlot from './ElementalDistributionPlot.svelte';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';

    const tab_items = ['size_distribution', 'structural_distribution', 'elemental_distribution'] as const;
</script>

<h3>Analysis plots</h3>

<div class="w-max">
    <TabBar tabs={[...tab_items]} let:tab bind:active={$active_tab}>
        <Tab {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
</div>

<SizeDistributionPlot />
<StructuralDistributionPlot />
<ElementalDistributionPlot />
