<script lang="ts">
    import { active_tab, current_post_analysis_files_directory, current_training_data_file } from './stores';
    import SizeDistributionPlot from './SizeDistributionPlot.svelte';
    import StructuralDistributionPlot from './StructuralDistributionPlot.svelte';
    import ElementalDistributionPlot from './ElementalDistributionPlot.svelte';
    import { parse_csv_file } from '$lib/utils';
    import FileLoader from '$lib/components/fileloader/FileLoader.svelte';
    import CustomTabs from '$lib/components/CustomTabs.svelte';
    import { Atom, Filter, ChartCandlestick, Pyramid, Ruler, Scale3D } from 'lucide-svelte/icons';
    import YDistributionPlot from './YDistributionPlot.svelte';
    import { CustomInput, Loadingbtn } from '$lib/components';

    const tab_items = [
        { tab: 'y-data_distribution', component: Ruler },
        { tab: 'size_distribution', component: Scale3D },
        { tab: 'structural_distribution', component: Pyramid },
        { tab: 'elemental_distribution', component: Atom },
    ];

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
    let current_active_analysis_tab = 'Plots';
    const MolecularAnalysis = getContext<MolecularAnalysisFunction>('MolecularAnalysis');
    const ApplyFilterForMolecularAnalysis = getContext<ApplyFilterForMolecularAnalysisFunction>(
        'ApplyFilterForMolecularAnalysis',
    );
    let filtered_filename = 'topelements';
</script>

<CustomTabs
    tabs={[
        { tab: 'load_filtered_data', component: Filter },
        { tab: 'Plots', component: ChartCandlestick },
    ]}
    bind:active={current_active_analysis_tab}
/>

<div class:hidden={current_active_analysis_tab !== 'Plots'} class="grid gap-2">
    <CustomTabs class="bordered" tabs={tab_items} bind:active={$active_tab} />
    {#if $active_tab !== 'y-data_distribution'}
        <div class="flex gap-1 items-end justify-center">
            <Loadingbtn
                name="Run full distribution analysis"
                subprocess={true}
                callback={async () => await MolecularAnalysis('all')}
            />
            <Loadingbtn
                name="Apply Xdata filters"
                subprocess={true}
                callback={async () => await ApplyFilterForMolecularAnalysis(filtered_filename)}
            />
            <CustomInput bind:value={filtered_filename} label="Enter filter name" />
        </div>
        <div class="divider"></div>
    {/if}
    {#await $current_training_data_file then _}
        <YDistributionPlot />
        <SizeDistributionPlot />
        <StructuralDistributionPlot />
        <ElementalDistributionPlot />
    {/await}
</div>

<div class:hidden={current_active_analysis_tab !== 'load_filtered_data'} class="grid gap-2">
    {#await $current_training_data_file then value}
        <FileLoader filename={value} />
    {/await}
</div>
