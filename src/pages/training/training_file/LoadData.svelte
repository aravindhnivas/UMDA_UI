<script lang="ts">
    import { use_dask } from '$lib/stores/system';
    import { use_filtered_data_for_training, filtered_dir } from './plot-analysis/stores';
    import { NPARTITIONS } from '$lib/stores/system';
    import {
        training_file,
        training_column_name_X,
        training_column_name_y,
        training_column_name_index,
        index_column_valid,
    } from './stores';
    import FileLoader from '$lib/components/fileloader/FileLoader.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { CustomInput, Loadingbtn } from '$lib/components';

    let auto_fetch_columns = false;
    let data: DataType;

    async function MakeIndexAndSaveFile() {
        const args = {
            filename: $training_file.filename,
            filetype: $training_file.filetype,
            key: $training_file.key,
            use_dask: $use_dask,
            index_column_name: $training_column_name_index,
        };
        const pyfile = 'training.make_index_and_save_file';
        return { pyfile, args };
    }
    $: $index_column_valid = data?.columns.includes($training_column_name_index) ?? false;
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
    <svelte:fragment let:load_btn>
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
            <CustomInput
                label="npartitions disk"
                bind:value={$NPARTITIONS}
                type="number"
                placeholder="Enter dask npartitions"
            />
        </div>

        <div class="flex items-end gap-1">
            <CustomInput label="Enter INDEX column name" bind:value={$training_column_name_index} />
            <Loadingbtn
                name="Make INDEX and save file"
                callback={MakeIndexAndSaveFile}
                on:result={e => {
                    console.log(e.detail);
                    load_btn?.click();
                }}
            />
            <span class="text-sm my-2">OR</span>
            <CustomSelect
                label="Choose INDEX column"
                bind:value={$training_column_name_index}
                items={data?.columns || []}
            />
            <span class="badge badge-info ml-auto" class:badge-error={!$index_column_valid}>
                {$index_column_valid ? 'Index available' : 'Index not available'}
            </span>
        </div>
    </svelte:fragment>
</FileLoader>
