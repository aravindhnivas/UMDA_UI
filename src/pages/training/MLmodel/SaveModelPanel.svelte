<script lang="ts">
    import { pre_trained_filename, save_pretrained_model, current_pretrained_file } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import Textfield from '@smui/textfield';
    import { Checkbox } from '$lib/components';
    import Notification from '$lib/components/Notification.svelte';
    import { ExternalLink } from 'lucide-svelte';
</script>

<CustomPanel>
    <svelte:fragment slot="title" let:open>
        <div class="flex-center">
            <span>Save Model</span>
            {#if !$save_pretrained_model}
                <div class="badge badge-sm badge-warning">NOT SAVING</div>
            {/if}
            {#if !open}
                <div class="badge badge-sm" class:badge-error={!$save_pretrained_model}>{$pre_trained_filename}</div>
            {/if}
        </div>
    </svelte:fragment>
    <div class="grid gap-2">
        <div class="flex gap-1">
            <Checkbox bind:value={$save_pretrained_model} label="Save" check="checkbox" />
        </div>
        <Textfield bind:value={$pre_trained_filename} label="save filename (.pkl)" />
        {#await $current_pretrained_file then value}
            {#await path.dirname(value) then save_loc_name}
                <Notification dismissable={false}>
                    <span>Save location: {save_loc_name}</span>
                    <button
                        class="btn btn-xs btn-outline"
                        on:click={async () => {
                            if (!save_loc_name) return;
                            await shell.open(save_loc_name);
                        }}
                    >
                        <ExternalLink />
                    </button>
                </Notification>
            {/await}
        {/await}
    </div>
</CustomPanel>
