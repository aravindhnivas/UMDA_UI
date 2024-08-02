<script lang="ts">
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { embedd_savefile_path } from '../embedding/stores';
    import { training_column_name_y, training_file } from '../training_file/stores';
</script>

<CustomPanel title="Loaded training file" open={true}>
    <div class="grid gap-2 grid-cols-4 items-center">
        <div class="col-span-1">Training file:</div>
        {#await path.basename($training_file.filename) then name}
            <div class="badge col-span-3" class:bg-red={!$training_file.filename}>
                {name || 'No file selected'}
            </div>
        {/await}
        <div class="col-span-1">Embedded vector file:</div>
        {#await $embedd_savefile_path then value}
            {#await path.basename(value) then name}
                <div class="badge col-span-3" class:bg-red={!value}>
                    {name || 'No file selected'}
                </div>
            {/await}
        {/await}

        <div class="col-span-1">Column (train_y):</div>
        <div class="badge col-span-3" class:bg-red={!$training_column_name_y}>
            {$training_column_name_y || 'Column not provided'}
        </div>
    </div>
</CustomPanel>
