<script lang="ts">
    import FileLoader from '../FileLoader.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import computePy from '$lib/pyserver/computePy';

    export let id: string = 'vicgae-train-container';
    export let display: string = 'none';

    const filename = localWritable('data_filename', '');
    let data: DataType | null = null;

    let filetype = 'csv';
    let key = 'data';
    let vector_size = 300;

    const generate_vec = async () => {
        toast.error('Under construction');
        return { pyfile: 'training.vicgae', args: {} };

        if (!$filename) {
            toast.error('Please select a file');
            return;
        }

        return {
            pyfile: 'training.vicgae',
            args: {
                smi_file: $filename,
                vector_size,
            },
        };
    };
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>Mol2Vec - embedder</h2>

    <h3>Load data file</h3>
    <FileLoader bind:filename={$filename} bind:data bind:filetype bind:key filetypes={['csv']} />

    <h3>Generate a VICGAE embedder model</h3>
    <!-- under construction -->
    <p class="text-red-500">Under construction</p>
    <!-- <Loadingbtn class="w-lg m-auto " name="Compute" callback={generate_vec} subprocess={true} /> -->
</div>
