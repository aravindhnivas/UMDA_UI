<script lang="ts">
    import LoadedFileInfos from '../embedding/LoadedFileInfos.svelte';

    export let id: string = 'umap-embedder-container';
    export let display: string = 'none';
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>UMAP - embedder</h2>
    <LoadedFileInfos />
</div>
