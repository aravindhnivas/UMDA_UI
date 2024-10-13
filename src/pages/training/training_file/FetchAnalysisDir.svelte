<script lang="ts">
    import {
        current_post_analysis_files_directory,
        current_training_data_file,
        filtered_dir,
        use_filtered_data_for_training,
    } from './plot-analysis/stores';
    import { load_analysis_dir, training_file } from './stores';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { RefreshCcw, ExternalLink, AlertCircle } from 'lucide-svelte/icons';
    import { onMount } from 'svelte';
    import { Checkbox } from '$lib/components';

    let dir_items_for_plotting: string[] = ['default'];

    const fetch_analysis_dir = async ({ warn = true } = {}) => {
        const analysis_dir = await $load_analysis_dir;
        const search_dir = await path.join(analysis_dir, 'filtered');
        if (!(await fs.exists(search_dir))) {
            // if (warn) toast.error(`Directory ${search_dir} does not exist`);
            if (warn) toast.warning('No filtered data found');
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
    $: if ($training_file['filename']) {
        dir_items_for_plotting = ['default'];
        fetch_analysis_dir({ warn: false }).catch(err => toast.error(err));
    }

    onMount(async () => {
        await fetch_analysis_dir({ warn: false });
    });
</script>

<hr />

{#await $current_post_analysis_files_directory then filedir}
    <div class="flex gap-1 items-center">
        <div role="alert" class="alert alert-info">
            <AlertCircle />
            <span>{filedir}</span>
        </div>
        <button
            class="btn btn-sm btn-outline"
            on:click={async () => {
                await shell.open(filedir);
            }}><ExternalLink size="20" /></button
        >
    </div>
{/await}

<div class="flex items-end gap-2">
    <div class="flex gap-2 items-end">
        <button class="btn btn-sm btn-square btn-outline" on:click={async () => await fetch_analysis_dir()}>
            <RefreshCcw size="20" />
        </button>
        <CustomSelect label="Select filtered directory" bind:value={$filtered_dir} items={dir_items_for_plotting} />
    </div>
    <Checkbox
        bind:value={$use_filtered_data_for_training}
        label="use filtered data for training"
        check="checkbox"
        on:change={() => {
            if (!$use_filtered_data_for_training) $filtered_dir = 'default';
        }}
    />
</div>
<div class="flex">
    {#if $use_filtered_data_for_training}
        {#if $filtered_dir == 'default'}
            <div class="badge badge-warning rounded-xl">
                If using filtered data, please select a directory other than 'default'
            </div>
        {:else}
            <div class="badge badge-info rounded-xl">
                NOTE: using filtered training dataset ({$filtered_dir})
            </div>
        {/if}
    {/if}
</div>
