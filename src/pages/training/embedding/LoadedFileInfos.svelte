<script lang="ts">
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import { embedd_savefile_path } from './stores';
    import { training_column_name_X, training_column_name_y } from '../training_file/stores';
    import { RefreshCcw } from 'lucide-svelte';

    let refresh = true;
</script>

<button class="flex btn btn-sm ml-auto mb-2" on:click={() => (refresh = !refresh)}>
    <span>Refresh</span>
    <RefreshCcw size="20" />
</button>

{#key refresh}
    <div class="grid gap-2 grid-cols-4 items-center">
        <div>Training file:</div>
        {#await $current_training_data_file then file_name}
            {#await fs.exists(file_name) then file_exists}
                <div class="col-span-3 border-rounded" class:bg-success={file_exists}>
                    <code class=" break-all text-sm p-1" class:bg-red={!file_exists}>{file_name}</code>
                </div>
            {/await}
        {/await}
        <div>Embedded vector file:</div>
        {#await $embedd_savefile_path then file_name}
            {#await fs.exists(file_name) then file_exists}
                <div class="col-span-3 border-rounded" class:bg-success={file_exists}>
                    <code class=" break-all text-sm p-1" class:bg-red={!file_exists}>{file_name}</code>
                </div>
            {/await}
        {/await}
        <div>Train X:</div>
        <div class="col-span-3 border-rounded" class:bg-red={!$training_column_name_X}>
            <code class=" break-all text-sm bg-success p-1" class:bg-success={$training_column_name_X}
                >{$training_column_name_X}</code
            >
        </div>
        <div>Train y:</div>
        <div class="col-span-3 border-rounded" class:bg-red={!$training_column_name_y}>
            <code class=" break-all text-sm p-1" class:bg-success={$training_column_name_y}
                >{$training_column_name_y}</code
            >
        </div>
        <!-- <slot /> -->
    </div>
{/key}
