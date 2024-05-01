<script lang="ts">
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import computePy from '$lib/pyserver/computePy';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { embeddings } from '../embedding/stores';

    export let id: string = 'pca-train-container';
    export let display: string = 'none';

    // const model_file = writable_store('pca_model_file', '');
    // const npy_file = writable_store('pca_npy_file', '');

    const pca_model_and_npy_files = writable_store<{
        [name: string]: {
            model_file: string;
            npy_file: string;
        };
    }>('pca_model_and_npy_files', {});

    const embeddings_save_loc = writable_store('pca_embeddings_save_loc', '');
    // const embedding_pipeline_loc = writable_store('pca_embedding_pipeline_loc', '');

    let radius = 1;
    let pca_dim = 70;
    let n_clusters = 20;
    // let use_embedding_pipeline = false;
    let compute_kmeans = false;
    let original_model = embeddings[0];

    const generate_pca = async (e: MouseEvent) => {
        if (!$pca_model_and_npy_files[original_model].model_file) {
            toast.error('Please select a model_file');
            return;
        }

        if (!$pca_model_and_npy_files[original_model].npy_file) {
            toast.error('Please select a .npy vectors file');
            return;
        }

        if (!$embeddings_save_loc) {
            toast.error('Please select a embeddings save location');
            return;
        }

        await computePy({
            pyfile: 'training.pca',
            args: {
                pca_dim,
                n_clusters,
                radius,
                embeddings_save_loc: $embeddings_save_loc,
                model_file: $pca_model_and_npy_files[original_model].model_file,
                npy_file: $pca_model_and_npy_files[original_model].npy_file,
                compute_kmeans,
                original_model,
            },
            general: true,
            target: e.target as HTMLButtonElement,
        });
    };

    $: if (original_model && !$pca_model_and_npy_files[original_model]) {
        $pca_model_and_npy_files[original_model] = {
            model_file: '',
            npy_file: '',
        };
    }
</script>

<div class="grid content-start gap-2" {id} style:display>
    <div class="grid">
        <h2>Principal component analysis</h2>
        <span class="text-sm">A linear dimensionality reduction technique</span>
    </div>

    <CustomSelect class="w-max" label="Choose model" bind:value={original_model} items={embeddings} />
    <BrowseFile bind:filename={$pca_model_and_npy_files[original_model].model_file} btn_name={'Browse model (.pkl)'} />
    <BrowseFile bind:filename={$pca_model_and_npy_files[original_model].npy_file} btn_name={'Browse vectors (.npy)'} />

    <div class="flex-center">
        <span>Compute KMeans clustering</span>
        <input type="checkbox" class="toggle" bind:checked={compute_kmeans} />
    </div>

    <div class="flex gap-1">
        <div class="flex flex-col gap-1">
            <span class="text-xs pl-1">radius</span>
            <input type="number" class="input input-sm" bind:value={radius} />
            <span class="text-xs pl-1 m-auto">Radius of morgan fingerprint</span>
        </div>

        <div class="flex flex-col gap-1">
            <span class="text-xs pl-1">pca_dim</span>
            <input type="number" class="input input-sm" bind:value={pca_dim} />
            <span class="text-xs pl-1 m-auto">PCA dimensions</span>
        </div>

        {#if compute_kmeans}
            <div class="flex flex-col gap-1">
                <span class="text-xs pl-1">n_clusters</span>
                <input type="number" class="input input-sm" bind:value={n_clusters} />
                <span class="text-xs pl-1 m-auto">KMeans Cluster</span>
            </div>
        {/if}
    </div>
    <BrowseFile directory={true} bind:filename={$embeddings_save_loc} btn_name={'Browse Save location'} />
    <Loadingbtn class="w-lg m-auto " name="Compute" callback={generate_pca} subprocess={true} />
</div>
