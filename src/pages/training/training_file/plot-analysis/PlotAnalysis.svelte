<script lang="ts">
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import { post_analysis_files } from './stores';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import Plot from 'svelte-plotly.js';

    const tab_items = ['size_distribution', 'structural_distribution', 'elemental_distribution'] as const;
    let active_tab: (typeof tab_items)[number] = 'size_distribution';
    let data: {
        size_distribution: Partial<Plotly.PlotData>[];
        structural_distribution: Partial<Plotly.PlotData>[];
        elemental_distribution: Partial<Plotly.PlotData>[];
    } = {
        size_distribution: [],
        structural_distribution: [],
        elemental_distribution: [],
    };

    const onPlot = async (name: (typeof tab_items)[number]) => {
        console.log(name);

        const csv_file = $post_analysis_files[name];
    };
</script>

<h3>Analysis plots</h3>

<div class="w-max">
    <TabBar tabs={[...tab_items]} let:tab bind:active={active_tab}>
        <Tab {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
</div>

{#each tab_items as name}
    <div class="grid gap-2 items-end" class:hidden={active_tab !== name}>
        <div class="grid grid-cols-5 items-end gap-2">
            <BrowseFile
                class="col-span-4"
                bind:filename={$post_analysis_files[name]}
                label="{name}.csv file"
                filters={[{ name: name, extensions: ['csv'] }]}
            />
            <button class="btn btn-sm" on:click={() => onPlot(name)}>Plot</button>
        </div>
        <div class="h-lg min-w-xl">
            <Plot
                data={data[name]}
                layout={{
                    xaxis: { title: 'True value' },
                    yaxis: { title: 'Predicted value' },
                    margin: { t: 0 },
                }}
                fillParent={true}
                debounce={250}
            />
        </div>
    </div>
{/each}
