<script lang="ts">
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { training_column_name_y } from '../training_file/stores';
    import { RefreshCcw } from 'lucide-svelte';
    import LoadedFileInfos from '../embedding/LoadedFileInfos.svelte';

    let refresh = true;
</script>

<CustomPanel title="Loaded training file" open={true}>
    <button class="flex btn btn-sm ml-auto mb-2" on:click={() => (refresh = !refresh)}>
        <span>Refresh</span>
        <RefreshCcw size="20" />
    </button>

    {#key refresh}
        <LoadedFileInfos>
            <div>Column (train_y):</div>
            <div class="badge badge-success col-span-3" class:badge-error={!$training_column_name_y}>
                {$training_column_name_y || 'Column not provided'}
            </div>
        </LoadedFileInfos>
    {/key}
</CustomPanel>
