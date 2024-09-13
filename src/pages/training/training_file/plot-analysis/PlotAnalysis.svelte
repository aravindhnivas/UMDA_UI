<script lang="ts">
    import {
        active_tab,
        filtered_dir,
        current_post_analysis_files_directory,
        current_training_data_file,
        use_filtered_data_for_training,
    } from './stores';
    import { load_analysis_dir, training_file } from '../stores';
    import SizeDistributionPlot from './SizeDistributionPlot.svelte';
    import StructuralDistributionPlot from './StructuralDistributionPlot.svelte';
    import ElementalDistributionPlot from './ElementalDistributionPlot.svelte';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { parse_csv_file } from '$lib/utils';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { RefreshCcw } from 'lucide-svelte';
    import { isArray } from 'lodash-es';
    import FileLoader from '$lib/components/fileloader/FileLoader.svelte';
    import Checkbox from '$lib/components/Checkbox.svelte';

    const tab_items = ['size_distribution', 'structural_distribution', 'elemental_distribution'] as const;

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
    let dir_items_for_plotting: string[] = ['default'];

    const fetch_analysis_dir = async ({ warn = true } = {}) => {
        const analysis_dir = await $load_analysis_dir;
        const search_dir = await path.join(analysis_dir, 'filtered');
        if (!(await fs.exists(search_dir))) {
            if (warn) toast.error(`Directory ${search_dir} does not exist`);
            $filtered_dir = 'default';
            dir_items_for_plotting = ['default'];
            return;
        }
        const dirs = await fs.readDir(search_dir);
        if (isEmpty(dirs)) {
            toast.error(`No directories found in ${search_dir}`);
            return;
        }
        const dir_items = dirs
            .filter(dir => isArray(dir.children))
            .map(dir => dir.name?.replace('_processed_data', '') as string);
        dir_items_for_plotting = ['default', ...dir_items.filter(Boolean)];
        if (warn) {
            toast.success(
                `Analysis directories loaded successfully: ${dir_items_for_plotting.length - 1} folders found`,
            );
        }
    };
    let current_active_analysis_tab = 'analysis_plots';
    $: if ($training_file['filename']) {
        dir_items_for_plotting = ['default'];
        fetch_analysis_dir({ warn: false }).catch(err => toast.error(err));
    }
    onMount(async () => {
        await fetch_analysis_dir({ warn: false });
    });
</script>

<div class="w-max">
    <TabBar tabs={['analysis_plots', 'load_filtered_data']} let:tab bind:active={current_active_analysis_tab}>
        <Tab {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
</div>

<div class="flex gap-2 items-end">
    <button class="btn btn-xs" on:click={async () => await fetch_analysis_dir()}>
        <RefreshCcw size="20" />
    </button>
    <CustomSelect label="Select analysis directory" bind:value={$filtered_dir} items={dir_items_for_plotting} />
</div>

<div class:hidden={current_active_analysis_tab !== 'analysis_plots'} class="grid gap-2">
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
</div>

<div class:hidden={current_active_analysis_tab !== 'load_filtered_data'} class="grid gap-2">
    <Checkbox bind:value={$use_filtered_data_for_training} label="use filtered data for training" check="checkbox" />
    {#await $current_training_data_file then value}
        <FileLoader filename={value} />
    {/await}
</div>
