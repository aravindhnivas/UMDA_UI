<script lang="ts">
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { embedd_savefile_path } from '../embedding/stores';
    import { training_column_name_y, training_file } from '../training_file/stores';
    import { use_filtered_data_for_training, load_training_file } from '../training_file/plot-analysis/stores';
</script>

<CustomPanel title="Loaded training file" open={true}>
    <div class="grid gap-2 grid-cols-4 items-center">
        <div class="badge badge-info col-span-4 h-[2.5rem] flex m-auto">
            {#await load_training_file($use_filtered_data_for_training) then name}
                {#await path.dirname(name) then dname}
                    <div class:bg-red={!dname}>
                        {dname || 'No file selected'}
                    </div>
                {/await}
            {/await}
        </div>
        <div>Training file:</div>
        {#await load_training_file($use_filtered_data_for_training) then name}
            {#await path.basename(name) then fname}
                <div class="badge col-span-3" class:bg-red={!name}>
                    {fname || 'No file selected'}
                </div>
            {/await}
        {/await}
        <div>Embedded vector file:</div>
        {#await $embedd_savefile_path then value}
            {#await path.basename(value) then name}
                <div class="badge col-span-3" class:bg-red={!value}>
                    {name || 'No file selected'}
                </div>
            {/await}
        {/await}

        <div>Column (train_y):</div>
        <div class="badge col-span-3" class:bg-red={!$training_column_name_y}>
            {$training_column_name_y || 'Column not provided'}
        </div>
    </div>
</CustomPanel>
