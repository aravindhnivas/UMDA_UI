<script lang="ts">
    import { pre_trained_filename, save_pretrained_model, current_pretrained_file } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import Textfield from '@smui/textfield';
    import { Checkbox } from '$lib/components';
    import Notification from '$lib/components/Notification.svelte';
</script>

<CustomPanel>
    <svelte:fragment slot="title" let:open>
        <div class="flex-center">
            <span>Save Model</span>
            {#if !$save_pretrained_model}
                <div class="badge badge-warning">NOT SAVING</div>
            {/if}
            {#if !open}
                <div class="badge badge-info">{$pre_trained_filename}</div>
            {/if}
        </div>
    </svelte:fragment>
    <div class="grid gap-2">
        <div class="flex gap-1">
            <Checkbox bind:value={$save_pretrained_model} label="Save" check="checkbox" />
        </div>
        <Textfield bind:value={$pre_trained_filename} label="save filename (.pkl)" />
        {#await $current_pretrained_file then value}
            <Notification message="Save location: {value}" />
        {/await}
    </div>
</CustomPanel>
