<script lang="ts">
    import {
        pre_trained_filename_unique,
        pre_trained_file_loc,
        pre_trained_filename,
        save_pretrained_model,
        save_pretrained_model_include_unique_key,
    } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Textfield from '@smui/textfield';
    import { Checkbox } from '$lib/components';
</script>

<CustomPanel>
    <svelte:fragment slot="title">
        <div class="flex-center">
            <span>Save Model</span>
            {#if !$save_pretrained_model}
                <div class="badge badge-warning">NOT SAVING</div>
            {:else if $pre_trained_filename_unique}
                <div class="badge badge-info">{$pre_trained_filename_unique}</div>
            {/if}
        </div>
    </svelte:fragment>
    <div class="grid gap-2">
        <div class="flex gap-1">
            <Checkbox bind:value={$save_pretrained_model} label="Save" check="checkbox" />
            <Checkbox bind:value={$save_pretrained_model_include_unique_key} label="DEV mode" check="checkbox" />
        </div>
        <BrowseFile directory={true} bind:filename={$pre_trained_file_loc} label="Save trained model" />
        <Textfield bind:value={$pre_trained_filename} label="save filename (.pkl)" />
    </div>
</CustomPanel>
