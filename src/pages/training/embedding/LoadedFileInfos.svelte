<script lang="ts">
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import { embedd_savefile_path } from './stores';
    import { training_column_name_X, training_column_name_y } from '../training_file/stores';
</script>

<div class="grid gap-2 grid-cols-4 items-center">
    <div>Training file:</div>
    {#await $current_training_data_file then file_name}
        {#await fs.exists(file_name) then file_exists}
            <div class="col-span-3 border-rounded bg-success">
                <code class=" break-all text-sm p-1" class:bg-red={!file_exists}>{file_name}</code>
            </div>
        {/await}
    {/await}
    <div>Embedded vector file:</div>
    {#await $embedd_savefile_path then file_name}
        {#await fs.exists(file_name) then file_exists}
            <div class="col-span-3 border-rounded bg-success">
                <code class=" break-all text-sm p-1" class:bg-red={!file_exists}>{file_name}</code>
            </div>
        {/await}
    {/await}
    <div>Train X:</div>
    <div class="col-span-3 border-rounded" class:bg-red={!$training_column_name_X}>
        <code class=" break-all text-sm bg-success p-1">{$training_column_name_X}</code>
    </div>
    <div>Train y:</div>
    <div class="col-span-3 border-rounded" class:bg-red={!$training_column_name_y}>
        <code class=" break-all text-sm bg-success p-1">{$training_column_name_y}</code>
    </div>
    <!-- <slot /> -->
</div>
