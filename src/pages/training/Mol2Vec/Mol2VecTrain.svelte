<script lang="ts">
    // import { CPU_COUNT } from '$lib/stores/system';
    import FileLoader from '$lib/components/fileloader/FileLoader.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    export let id: string = 'mol2vec-train-container';
    export let display: string = 'none';

    const filename = localWritable('data_filename', '');
    let data: DataType | null = null;

    let filetype = 'smi';
    let key = 'data';

    let corpus_file = '';
    let sentence_type = 'alt';
    const sentence_type_info: Record<string, string> = {
        all: 'generates all corpus files for all types of sentences',
        alt: 'generates a corpus file with only combined alternating sentence',
        individual: 'generates corpus files for each radius',
    };
    let vector_size = 300;
    let radius = 1;

    let min_count = 1;

    const generate_mol2vec = async () => {
        if (!$filename) {
            toast.error('Please select a file');
            return;
        }
        return {
            pyfile: 'training.mol2vec',
            args: {
                smi_file: $filename,
                sentence_type,
                radius,
                vector_size,
                min_count,
                corpus_file,
            },
        };
    };
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>Mol2Vec - embedder</h2>

    <h3>Load file containing SMILES</h3>
    <FileLoader bind:filename={$filename} bind:data bind:filetype bind:key filetypes={['smi']} />

    <h3>Generate a Mol2Vec embedder model</h3>

    <div class="flex flex-wrap gap-1">
        <CustomSelect
            label="sentence_type"
            bind:value={sentence_type}
            items={['all', 'alt', 'individual']}
            helper={sentence_type_info[sentence_type]}
        />
        <CustomInput label="radius" type="number" bind:value={radius} helper="Radius of morgan fingerprint" />
        <CustomInput
            label="vector_size"
            type="number"
            bind:value={vector_size}
            helper="Number of dimensions of vector"
        />
        <CustomInput
            label="min_count"
            type="number"
            bind:value={min_count}
            helper="Number of occurrences a word should have to be considered in training"
        />
    </div>

    <BrowseFile
        bind:filename={corpus_file}
        btn_name={'Browse corpus_file'}
        label="Optional. Choose corpus file if you have one!"
    />
    <Loadingbtn class="m-auto" callback={generate_mol2vec} subprocess={true} name="generate_mol2vec" />
</div>
