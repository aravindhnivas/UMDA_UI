<script lang="ts">
    import { HelpCircle } from 'lucide-svelte/icons';
    import FileLoader from './../FileLoader.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import computePy from '$lib/pyserver/computePy';
    export let id: string = 'mol2vec-train-container';
    export let display: string = 'none';

    const filename = writable_store('data_filename', '');
    let data: DataType | null = null;
    let filetype = 'csv';
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
    let n_jobs = 32;
    let min_count = 1;

    const generate_mol2vec = async (e: MouseEvent) => {
        if (!$filename) {
            toast.error('Please select a file');
            return;
        }

        await computePy({
            pyfile: 'training.mol2vec',
            args: {
                smi_file: $filename,
                sentence_type,
                radius,
                vector_size,
                min_count,
                n_jobs,
                corpus_file,
            },
            general: true,
            target: e.target as HTMLButtonElement,
        });
    };
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>Mol2Vec - create embedder</h2>

    <h3>Load data file</h3>
    <FileLoader bind:filename={$filename} bind:data bind:filetype bind:key filetypes={['csv']} />

    <h3>Generate a Mol2Vec embedder model</h3>

    <div class="flex gap-1">
        <CustomSelect
            label="sentence_type"
            bind:value={sentence_type}
            items={['all', 'alt', 'individual']}
            helper={sentence_type_info[sentence_type]}
        />
        <div class="flex flex-col gap-1">
            <span class="text-xs pl-1">radius</span>
            <input type="number" class="input input-sm" bind:value={radius} />
            <span class="text-xs pl-1 m-auto">Radius of morgan fingerprint</span>
        </div>

        <div class="flex flex-col gap-1">
            <span class="text-xs pl-1">vector_size</span>
            <input type="number" class="input input-sm" bind:value={vector_size} />
            <span class="text-xs pl-1 m-auto">Number of dimensions of vector</span>
        </div>

        <div class="flex flex-col gap-1">
            <span class="text-xs pl-1">min_count</span>
            <input type="number" class="input input-sm" bind:value={min_count} />
            <span class="text-xs pl-1 m-auto">
                Number of occurrences a word should have to be considered in training</span
            >
        </div>

        <div class="flex flex-col gap-1">
            <span class="text-xs pl-1">n_jobs</span>
            <input type="number" class="input input-sm" bind:value={n_jobs} />
            <span class="text-xs pl-1 m-auto">Number of cpu cores used for calculation</span>
        </div>
    </div>

    <BrowseFile
        bind:filename={corpus_file}
        btn_name={'Browse corpus_file'}
        label="Optional. Choose corpus file if you have one!"
    />
    <Loadingbtn class="w-lg m-auto " name="Compute" callback={generate_mol2vec} subprocess={true} />
</div>
