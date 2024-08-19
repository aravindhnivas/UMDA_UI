<script lang="ts">
    import { active_tab, post_analysis_files_directory } from './stores';
    import SizeDistributionPlot from './SizeDistributionPlot.svelte';
    import StructuralDistributionPlot from './StructuralDistributionPlot.svelte';
    import ElementalDistributionPlot from './ElementalDistributionPlot.svelte';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { parse_csv_file } from '$lib/utils';

    const tab_items = ['size_distribution', 'structural_distribution', 'elemental_distribution'] as const;

    const GetData = async <T = string | number,>(name: string) => {
        const csv_file = await path.join(await $post_analysis_files_directory, name);
        if (!(await fs.exists(csv_file))) {
            toast.error(`File ${csv_file} does not exist`);
            return;
        }

        const { columns, data } = await parse_csv_file(csv_file);

        const x = data.map(row => row[0]).filter(Boolean) as T[];
        const y = data
            .map(row => row[1])
            .filter(Boolean)
            .map(Number);

        return { x, y };
    };
    setContext('GetData', GetData);
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
