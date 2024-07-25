<script lang="ts">
    import { model, parameters } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import ModelParameters from './ModelParameters.svelte';
    import Notification from '$lib/components/Notification.svelte';
</script>

<CustomPanel title="More options">
    {#if $parameters?.[$model]}
        <ModelParameters key="parameters" bind:values={$parameters[$model]} />
    {:else}
        <Notification message="No parameters found" type="error" />
    {/if}
</CustomPanel>
