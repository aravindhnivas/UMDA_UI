<script lang="ts">
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { embedd_savefile_path } from '../embedding/stores';
    import { training_column_name_y } from '../training_file/stores';
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import { RefreshCcw } from 'lucide-svelte';
    import ResolveFilename from '$lib/components/ResolveFilename.svelte';

    let refresh = true;
</script>

<CustomPanel title="Loaded training file" open={true}>
    <button class="flex btn btn-sm ml-auto" on:click={() => (refresh = !refresh)}>
        <span>Refresh</span>
        <RefreshCcw size="20" />
    </button>

    {#key refresh}
        <div class="grid gap-2 grid-cols-4 items-center">
            <!-- <ResolveFilename
                filename={$current_training_data_file}
                basename={false}
                class="badge badge-success col-span-4 h-[2.5rem] flex m-auto"
            /> -->
            <div>Training file:</div>
            <ResolveFilename filename={$current_training_data_file} class="badge badge-success col-span-3" />
            <div>Embedded vector file:</div>
            <ResolveFilename filename={$embedd_savefile_path} class="badge badge-success col-span-3" />
            <div>Column (train_y):</div>
            <div class="badge badge-success col-span-3" class:badge-error={!$training_column_name_y}>
                {$training_column_name_y || 'Column not provided'}
            </div>
        </div>
    {/key}
</CustomPanel>
