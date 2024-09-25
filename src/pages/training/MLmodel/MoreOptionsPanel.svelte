<script lang="ts">
    import { default_parameter_mode, model, parameters } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import ModelParameters from './ModelParameters.svelte';
    import Notification from '$lib/components/Notification.svelte';
</script>

<CustomPanel>
    <svelte:fragment slot="title" let:open>
        <div class="flex-center">
            <span>More options</span>
            {#if !open}
                {#if $default_parameter_mode}
                    <span class="badge">Default mode</span>
                {/if}
            {/if}
        </div>
    </svelte:fragment>
    {#if $default_parameter_mode}
        <div class="p-2">
            <Notification message="Default mode" type="info" dismissable={false} />
        </div>
    {:else if $parameters?.[$model]}
        <ModelParameters key="parameters" bind:values={$parameters[$model]} />
    {:else}
        <Notification message="No parameters found" type="error" />
    {/if}
</CustomPanel>
