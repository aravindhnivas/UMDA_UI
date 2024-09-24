<script lang="ts">
    import { active_tab, current_post_analysis_files_directory, current_training_data_file } from './stores';
    import SizeDistributionPlot from './SizeDistributionPlot.svelte';
    import StructuralDistributionPlot from './StructuralDistributionPlot.svelte';
    import ElementalDistributionPlot from './ElementalDistributionPlot.svelte';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { parse_csv_file } from '$lib/utils';
    import FileLoader from '$lib/components/fileloader/FileLoader.svelte';
    import FetchAnalysisDir from '../FetchAnalysisDir.svelte';
    import YDistributionPlot from './YDistributionPlot.svelte';

    const tab_items = [
        'y-data_distribution',
        'size_distribution',
        'structural_distribution',
        'elemental_distribution',
    ] as const;

    const GetData = async <T = string | number,>(name: string) => {
        const analysis_dir = await $current_post_analysis_files_directory;
        const csv_file = await path.join(analysis_dir, name);
        console.log(csv_file);
        if (!(await fs.exists(csv_file))) {
            toast.error(`File ${csv_file} does not exist`);
            return;
        }
        const { data } = await parse_csv_file(csv_file);

        const x = data.map(row => row[0]).filter(Boolean) as T[];
        const y = data
            .map(row => row[1])
            .filter(Boolean)
            .map(Number);

        return { x, y };
    };
    setContext('GetData', GetData);
    let current_active_analysis_tab = 'analysis_plots';
</script>

<div class="w-max">
    <TabBar tabs={['analysis_plots', 'load_filtered_data']} let:tab bind:active={current_active_analysis_tab}>
        <Tab {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
</div>

<!-- <FetchAnalysisDir /> -->

<div class:hidden={current_active_analysis_tab !== 'analysis_plots'} class="grid gap-2">
    <div class="w-max">
        <TabBar tabs={[...tab_items]} let:tab bind:active={$active_tab}>
            <Tab {tab}>
                <Label>{tab}</Label>
            </Tab>
        </TabBar>
    </div>
    <YDistributionPlot />
    <SizeDistributionPlot />
    <StructuralDistributionPlot />
    <ElementalDistributionPlot />
</div>

<div class:hidden={current_active_analysis_tab !== 'load_filtered_data'} class="grid gap-2">
    {#await $current_training_data_file then value}
        <FileLoader filename={value} />
    {/await}
</div>
