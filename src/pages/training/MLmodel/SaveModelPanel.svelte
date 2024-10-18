<script lang="ts">
    import { pre_trained_filename, save_pretrained_model, current_pretrained_file } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { Checkbox, CustomInput } from '$lib/components';
    import Notification from '$lib/components/Notification.svelte';
    import { ExternalLink } from 'lucide-svelte/icons';
    import FileExists from '$lib/components/FileExists.svelte';
</script>

<CustomPanel open={true}>
    <svelte:fragment slot="title" let:open>
        <div class="flex-center">
            <span>Save Model</span>
            {#if !$save_pretrained_model}
                <div class="badge badge-warning">NOT SAVING</div>
            {/if}
            {#if !open}
                <div class="badge" class:badge-error={!$save_pretrained_model}>{$pre_trained_filename}</div>
            {/if}
        </div>
    </svelte:fragment>
    <div class="grid gap-2">
        <div class="flex gap-1">
            <Checkbox bind:value={$save_pretrained_model} label="Save" check="checkbox" />
        </div>
        <CustomInput bind:value={$pre_trained_filename} label="save filename" lock={true} />
        <FileExists name={$current_pretrained_file} let:dirname={save_loc_name} show_if_not_exists>
            <Notification dismissable={false}>
                <div class="grid gap-2">
                    <span>Save location: {save_loc_name}</span>
                    <button
                        class="btn btn-sm btn-outline w-max ml-auto"
                        on:click={async () => {
                            if (!save_loc_name) return;
                            try {
                                await shell.open(save_loc_name);
                            } catch (error) {
                                if (error instanceof Error) toast.error(error?.message);
                            }
                        }}
                    >
                        <span>Open folder</span>
                        <ExternalLink />
                    </button>
                </div>
            </Notification>
        </FileExists>
    </div>
</CustomPanel>
