<script lang="ts">
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { embedd_savefile_path } from '../embedding/stores';
    import { training_column_name_y } from '../training_file/stores';
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import { RefreshCcw } from 'lucide-svelte';

    let refresh = true;
</script>

<CustomPanel title="Loaded training file" open={true}>
    <button class="flex btn btn-sm ml-auto mb-2" on:click={() => (refresh = !refresh)}>
        <span>Refresh</span>
        <RefreshCcw size="20" />
    </button>

    {#key refresh}
        <div class="grid gap-2 grid-cols-4 items-center">
            <div>Training file:</div>
            {#await $current_training_data_file then file_name}
                {#await fs.exists(file_name) then file_exists}
                    <div class="col-span-3 bg-success border-rounded p-1" class:bg-red={!file_exists}>
                        <code class=" break-words text-sm">{file_name}</code>
                    </div>
                {/await}
            {/await}
            <div>Embedded vector file:</div>
            {#await $embedd_savefile_path then file_name}
                {#await fs.exists(file_name) then file_exists}
                    <div class="col-span-3 bg-success border-rounded p-1" class:bg-red={!file_exists}>
                        <code class=" break-words text-sm">{file_name}</code>
                    </div>
                {/await}
            {/await}
            <div>Column (train_y):</div>
            <div class="badge badge-success col-span-3" class:badge-error={!$training_column_name_y}>
                {$training_column_name_y || 'Column not provided'}
            </div>
        </div>
    {/key}
</CustomPanel>
