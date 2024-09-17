<script lang="ts">
    import { use_filtered_data_for_training, filtered_dir } from './plot-analysis/stores';
    import { use_dask } from '$lib/stores/system';
    import { NPARTITIONS } from '$lib/stores/system';
    import {
        training_file,
        training_column_name_X,
        training_column_name_y,
        training_column_name_index,
        index_column_valid,
        training_save_directory,
        loaded_df_columns,
    } from './stores';
    import FileLoader from '$lib/components/fileloader/FileLoader.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { Checkbox, CustomInput, Loadingbtn } from '$lib/components';
    import FetchAnalysisDir from './FetchAnalysisDir.svelte';

    let auto_fetch_columns = false;
    let data: DataType | null = null;

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
    $: if ($training_file['filename']) {
        $use_filtered_data_for_training = false;
        $filtered_dir = 'default';
        $training_column_name_X = 'SMILES';
        $training_column_name_y = '';
        data = null;
    }
</script>

<FileLoader
    bind:use_dask={$use_dask}
    bind:filename={$training_file['filename']}
    bind:filetype={$training_file['filetype']}
    bind:key={$training_file['key']}
    on:load={async e => {
        if (!e.detail) return;
        data = e.detail;
        if (!data) return;

        $loaded_df_columns = data.columns || [];

        if (!data.columns.includes($training_column_name_X)) $training_column_name_X = '';
        if (!data.columns.includes($training_column_name_y)) $training_column_name_y = '';

        auto_fetch_columns = true;
        if (!(await fs.exists($training_save_directory))) {
            await fs.createDir($training_save_directory);
            console.log(`Directory created: ${$training_save_directory}`);
        } else {
            console.warn(`Directory already exists: ${$training_save_directory}`);
        }
    }}
>
    <svelte:fragment let:load_btn>
        {#await fs.exists($training_file.filename) then file_exists}
            {#if file_exists}
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
                        items={$loaded_df_columns}
                    />
                    <CustomSelect
                        use_input={!auto_fetch_columns}
                        label="column Y"
                        bind:value={$training_column_name_y}
                        items={$loaded_df_columns}
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

                <div class="flex items-end gap-2">
                    <FetchAnalysisDir />
                    <Checkbox
                        bind:value={$use_filtered_data_for_training}
                        label="use filtered data for training"
                        check="checkbox"
                    />
                </div>
                {#if $use_filtered_data_for_training}
                    {#if $filtered_dir == 'default'}
                        <div class="badge-sm badge-warning">
                            If using filtered data, please select a directory other than 'default'
                        </div>
                    {:else}
                        <div class="badge-sm badge-info">
                            NOTE: using filtered training dataset ({$filtered_dir})
                        </div>
                    {/if}
                {/if}
            {/if}
        {/await}
    </svelte:fragment>
</FileLoader>
