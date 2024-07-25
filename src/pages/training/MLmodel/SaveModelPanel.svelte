<script lang="ts">
    import { pre_trained_file_loc, pre_trained_filename } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Textfield from '@smui/textfield';
</script>

<CustomPanel title="Save Model">
    <div class="grid gap-2">
        <BrowseFile directory={true} bind:filename={$pre_trained_file_loc} label="Save trained model" />
        <Textfield bind:value={$pre_trained_filename} label="save filename (.pkl)" />
    </div>
</CustomPanel>
