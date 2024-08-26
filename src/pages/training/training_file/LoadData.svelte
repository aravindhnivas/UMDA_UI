<script lang="ts">
    import { use_dask } from '$lib/stores/system';
    import { use_filtered_data_for_training, filtered_dir } from './plot-analysis/stores';
    import { NPARTITIONS } from '$lib/stores/system';
    import { training_file, training_column_name_X, training_column_name_y } from './stores';
    import FileLoader from '$lib/components/fileloader/FileLoader.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';

    let auto_fetch_columns = false;
    let data: DataType;
</script>

{#if $use_filtered_data_for_training && $filtered_dir !== 'default'}
    <div class="badge badge-info m-auto">
        NOTE: using filtered training dataset ({$filtered_dir}). Change it in Analysis_data -> Load filtered data.
    </div>
{/if}

<FileLoader
    bind:use_dask={$use_dask}
    bind:filename={$training_file['filename']}
    bind:filetype={$training_file['filetype']}
    bind:key={$training_file['key']}
    on:load={e => {
        if (!e.detail) return;
        data = e.detail;
        auto_fetch_columns = true;
    }}
>
    <div class="flex flex-col gap-1">
        <div class="flex-center">
            <div class="flex-center border-1 border-solid border-rounded p-1">
                <span>Auto-fetch column name</span>
                <input type="checkbox" class="toggle" bind:checked={auto_fetch_columns} />
            </div>
        </div>

        {#if auto_fetch_columns && !data?.columns.length}
            <span class="text-sm">Load file first!</span>
        {/if}
    </div>
    <div class="flex items-end gap-1">
        <CustomSelect
            use_input={!auto_fetch_columns}
            label="column X"
            bind:value={$training_column_name_X}
            items={data?.columns || []}
        />
        <CustomSelect
            use_input={!auto_fetch_columns}
            label="column Y"
            bind:value={$training_column_name_y}
            items={data?.columns || []}
        />
        <div class="flex flex-col gap-1">
            <span class="text-xs pl-1">npartitions disk</span>
            <input
                bind:value={$NPARTITIONS}
                type="number"
                class="input input-sm"
                placeholder="Enter dask npartitions"
            />
        </div>
    </div>
</FileLoader>
