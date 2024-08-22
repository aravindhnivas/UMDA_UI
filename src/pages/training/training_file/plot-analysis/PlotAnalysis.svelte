<script lang="ts">
    import { active_tab, filtered_dir, current_post_analysis_files_directory } from './stores';
    import { load_analysis_dir } from '../stores';
    import SizeDistributionPlot from './SizeDistributionPlot.svelte';
    import StructuralDistributionPlot from './StructuralDistributionPlot.svelte';
    import ElementalDistributionPlot from './ElementalDistributionPlot.svelte';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { parse_csv_file } from '$lib/utils';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { RefreshCcw } from 'lucide-svelte';
    import { isArray } from 'lodash-es';

    const tab_items = ['size_distribution', 'structural_distribution', 'elemental_distribution'] as const;

    const GetData = async <T = string | number,>(name: string) => {
        const analysis_dir = await $current_post_analysis_files_directory;
        const csv_file = await path.join(analysis_dir, name);
        console.log(csv_file);
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
    let dir_items_for_plotting: string[] = ['default'];

    const fetch_analysis_dir = async ({ warn = true } = {}) => {
        const analysis_dir = await $load_analysis_dir;
        const search_dir = await path.join(analysis_dir, 'filtered');
        if (!(await fs.exists(search_dir))) {
            if (warn) toast.error(`Directory ${search_dir} does not exist`);
            $filtered_dir = 'default';
            return;
        }
        const dirs = await fs.readDir(search_dir);
        if (isEmpty(dirs)) {
            toast.error(`No directories found in ${search_dir}`);
            return;
        }
        const dir_items = dirs.filter(dir => isArray(dir.children)).map(dir => dir.name as string);
        dir_items_for_plotting = ['default', ...dir_items.filter(Boolean)];
        toast.success(`Analysis directories loaded successfully: ${dir_items_for_plotting.length - 1} folders found`);
        // console.log(dir_items);
    };

    onMount(async () => {
        await fetch_analysis_dir({ warn: false });
    });
</script>

<h3>Analysis plots</h3>

<div class="flex gap-2 items-end">
    <button class="btn btn-xs" on:click={async () => await fetch_analysis_dir()}>
        <RefreshCcw size="20" />
    </button>
    <CustomSelect label="Select analysis directory" bind:value={$filtered_dir} items={dir_items_for_plotting} />
</div>

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
