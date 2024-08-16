<script lang="ts">
    import {
        pre_trained_filename_unique,
        pre_trained_file_loc,
        pre_trained_filename,
        save_pretrained_model,
        current_save_filekey,
    } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Textfield from '@smui/textfield';
    import { Checkbox } from '$lib/components';

    // $: filename = $pre_trained_filename.split('.pkl')[0] + `_${$current_save_filekey}_`;
</script>

<CustomPanel>
    <svelte:fragment slot="title">
        <div class="flex-center">
            <span>Save Model</span>
            {#if !$save_pretrained_model}
                <div class="badge badge-warning">NOT SAVING</div>
            {:else if $current_save_filekey}
                <div class="badge badge-info">{$pre_trained_filename_unique}</div>
            {/if}
        </div>
    </svelte:fragment>
    <div class="grid gap-2">
        <Checkbox bind:value={$save_pretrained_model} label="Save" check="checkbox" />
        <BrowseFile directory={true} bind:filename={$pre_trained_file_loc} label="Save trained model" />
        <Textfield bind:value={$pre_trained_filename} label="save filename (.pkl)" />
    </div>
</CustomPanel>
