<script lang="ts">
    import { default_cpu_count, MAX_CPU } from '$lib/stores/system';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import computePy from '$lib/pyserver/computePy';

    export let id: string = 'pca-train-container';
    export let display: string = 'none';

    const model_file = writable_store('pca_model_file', '');
    const npy_file = writable_store('pca_npy_file', '');

    const embeddings_save_loc = writable_store('pca_embeddings_save_loc', '');
    const embedding_pipeline_loc = writable_store('pca_embedding_pipeline_loc', '');

    let radius = 1;
    let pca_dim = 70;
    let n_clusters = 20;

    const generate_pca = async (e: MouseEvent) => {
        if (!$model_file) {
            toast.error('Please select a model_file');
            return;
        }

        if (!$npy_file) {
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
                embedding_pipeline_loc: $embedding_pipeline_loc,
                model_file: $model_file,
                npy_file: $npy_file,
            },
            general: true,
            target: e.target as HTMLButtonElement,
        });
    };
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>PCA - embedder</h2>

    <BrowseFile bind:filename={$model_file} btn_name={'Browse model (.pkl)'} />
    <BrowseFile bind:filename={$npy_file} btn_name={'Browse vectors (.npy)'} />

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

        <div class="flex flex-col gap-1">
            <span class="text-xs pl-1">n_clusters</span>
            <input type="number" class="input input-sm" bind:value={n_clusters} />
            <span class="text-xs pl-1 m-auto">KMeans Cluster</span>
        </div>
    </div>

    <BrowseFile bind:filename={$embedding_pipeline_loc} btn_name={'Browse pipeline'} label="Optional" />
    <BrowseFile directory={true} bind:filename={$embeddings_save_loc} btn_name={'Browse Save location'} />
    <Loadingbtn class="w-lg m-auto " name="Compute" callback={generate_pca} subprocess={true} />
</div>
