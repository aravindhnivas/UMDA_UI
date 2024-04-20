<script lang="ts">
    import FileLoader from './../FileLoader.svelte';
    export let id: string = 'mol2vec-train-container';
    export let display: string = 'none';

    const filename = writable_store('data_filename', '');
    let data: DataType | null = null;
    let filetype = 'csv';
    let key = 'data';
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>Mol2Vec - create embedder</h2>

    <h3>Load data file</h3>
    <FileLoader bind:filename={$filename} bind:data bind:filetype bind:key />

    <h3>Generate a Mol2Vec embedder model</h3>
</div>
