<script lang="ts">
    import { NPARTITIONS } from '$lib/stores/system';
    import { training_file, training_column_name_X, training_column_name_y } from './stores';
    import FileLoader from '../FileLoader.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';

    export let id: string = 'training-file-container';
    export let display: string = 'none';

    let auto_fetch_columns = false;
    let data: DataType;
</script>

<div class="grid content-start gap-2" {id} style:display>
    <div class="flex justify-between">
        <h2>Embeddings</h2>
    </div>

    <h3>Load data file</h3>
    <FileLoader
        bind:filename={$training_file['filename']}
        bind:filetype={$training_file['filetype']}
        bind:key={$training_file['key']}
        on:load={e => {
            if (!e.detail) return;
            data = e.detail;
            auto_fetch_columns = true;
        }}
    />
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
        {#if auto_fetch_columns}
            <CustomSelect label="column X" bind:value={$training_column_name_X} items={data?.columns || []} />
            <CustomSelect label="column Y" bind:value={$training_column_name_y} items={data?.columns || []} />
        {:else}
            <div class="flex flex-col gap-1">
                <span class="text-xs pl-1">Enter column X</span>
                <input
                    type="text"
                    class="input input-sm"
                    bind:value={$training_column_name_X}
                    placeholder="Enter column X"
                />
            </div>
            <div class="flex flex-col gap-1">
                <span class="text-xs pl-1">Enter column Y</span>
                <input
                    type="text"
                    class="input input-sm"
                    bind:value={$training_column_name_y}
                    placeholder="Enter column Y"
                />
            </div>
        {/if}
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
</div>
