<script lang="ts">
    import { HelpCircle } from 'lucide-svelte/icons';
    import FileLoader from './../FileLoader.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    export let id: string = 'mol2vec-train-container';
    export let display: string = 'none';

    const filename = writable_store('data_filename', '');
    let data: DataType | null = null;
    let filetype = 'csv';
    let key = 'data';

    let corpus_file = '';
    let sentence_type = 'alt';

    let vector_size = 300;
    let radius = 1;
    let n_jobs = 1;
    let min_count = 1;
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>Mol2Vec - create embedder</h2>

    <h3>Load data file</h3>
    <FileLoader bind:filename={$filename} bind:data bind:filetype bind:key filetypes={['csv']} />

    <h3>Generate a Mol2Vec embedder model</h3>
    <BrowseFile bind:filename={corpus_file} btn_name={'Browse corpus_file'} />
</div>
