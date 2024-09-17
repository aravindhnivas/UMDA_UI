<script lang="ts">
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import { embedd_savefile_path } from './stores';
    import { training_column_name_X, training_column_name_y } from '../training_file/stores';
    import { RefreshCcw, ArrowBigRight } from 'lucide-svelte/icons';

    export let show_embedded_file = true;
    let refresh = true;
</script>

<div class="flex items-center justify-between">
    <div class="flex gap-1 items-end">
        <code>File status indicator</code>
        <ArrowBigRight size="20" />
        <code class="badge badge-success">EXISTS</code>
        <code class="badge badge-error">DOESN'T-EXISTS</code>
    </div>
    <button class="flex btn btn-sm mb-2" on:click={() => (refresh = !refresh)}>
        <span>Refresh</span>
        <RefreshCcw size="20" />
    </button>
</div>

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
        {#if show_embedded_file}
            <div>Embedded vector file:</div>
            {#await $embedd_savefile_path then file_name}
                {#await fs.exists(file_name) then file_exists}
                    <div class="col-span-3 border-rounded" class:bg-success={file_exists}>
                        <code class=" break-all text-sm p-1" class:bg-red={!file_exists}>{file_name}</code>
                    </div>
                {/await}
            {/await}
        {/if}

        <div>Train X:</div>
        <div class="col-span-3 border-rounded" class:bg-red={!$training_column_name_X}>
            <code class=" break-all text-sm bg-success p-1" class:bg-success={$training_column_name_X}
                >{$training_column_name_X || 'Please select a X - training column'}</code
            >
        </div>
        <div>Train y:</div>
        <div class="col-span-3 border-rounded" class:bg-red={!$training_column_name_y}>
            <code class=" break-all text-sm p-1" class:bg-success={$training_column_name_y}
                >{$training_column_name_y || 'Please select a Y - training column'}</code
            >
        </div>
    </div>
{/key}
