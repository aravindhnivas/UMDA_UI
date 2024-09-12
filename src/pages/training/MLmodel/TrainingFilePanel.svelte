<script lang="ts">
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import LoadedFileInfos from '../embedding/LoadedFileInfos.svelte';
</script>

<CustomPanel title="Loaded training file" open={true}>
    <LoadedFileInfos />
</CustomPanel>
