<script lang="ts">
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { embedd_savefile_path } from '../embedding/stores';
    import { training_column_name_y } from '../training_file/stores';
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
</script>

<CustomPanel title="Loaded training file" open={true}>
    <div class="grid gap-2 grid-cols-4 items-center">
        <div class="badge badge-info col-span-4 h-[2.5rem] flex m-auto">
            {#await $current_training_data_file then name}
                {#await path.dirname(name) then dname}
                    <div class:bg-red={!dname}>
                        {dname || 'No file selected'}
                    </div>
                {/await}
            {/await}
        </div>
        <div>Training file:</div>
        {#await $current_training_data_file then name}
            {#await path.basename(name) then fname}
                <div class="badge col-span-3" class:bg-red={!name}>
                    {fname || 'No file selected'}
                </div>
            {/await}
        {/await}
        <div>Embedded vector file:</div>
        {#await $embedd_savefile_path then file_path}
            {#await fs.exists(file_path) then file_exists}
                {#await path.basename(file_path) then name}
                    <div class="badge col-span-3" class:bg-red={!file_exists}>
                        {name || 'No file selected'}
                    </div>
                {/await}
            {/await}
        {/await}

        <div>Column (train_y):</div>
        <div class="badge col-span-3" class:bg-red={!$training_column_name_y}>
            {$training_column_name_y || 'Column not provided'}
        </div>
    </div>
</CustomPanel>
