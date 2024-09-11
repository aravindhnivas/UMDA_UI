<script lang="ts">
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import { embedd_savefile_path } from './stores';
</script>

<div class="grid gap-2 grid-cols-4 items-center">
    <div>Training file:</div>
    {#await $current_training_data_file then file_name}
        {#await fs.exists(file_name) then file_exists}
            <div class="col-span-3 bg-success border-rounded p-1" class:bg-red={!file_exists}>
                <code class=" break-all text-sm">{file_name}</code>
            </div>
        {/await}
    {/await}
    <div>Embedded vector file:</div>
    {#await $embedd_savefile_path then file_name}
        {#await fs.exists(file_name) then file_exists}
            <div class="col-span-3 bg-success border-rounded p-1" class:bg-red={!file_exists}>
                <code class=" break-all text-sm">{file_name}</code>
            </div>
        {/await}
    {/await}
    <slot />
</div>
