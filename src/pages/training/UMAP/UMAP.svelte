<script lang="ts">
    import { cleanlab } from './../MLmodel/stores';
    import { umap_metrics } from './stores';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import LoadedFileInfos from '../embedding/LoadedFileInfos.svelte';
    import SaveAndLoadState from '$lib/components/SaveAndLoadState.svelte';

    export let id: string = 'umap-embedder-container';
    export let display: string = 'none';

    let loaded_files: LoadedInfosFile;

    const params_description: Record<keyof UMAPParams, string> = {
        n_neighbors:
            'This parameter controls how UMAP balances local versus global structure in the data. Lower values will force UMAP to concentrate on very local structure (potentially to the detriment of the big picture), while larger values will push UMAP to look at larger neighborhoods of each point when making embeddings.',
        min_dist:
            'The effective minimum distance between embedded points. Smaller values will result in a more clustered embedding. Higher values will force the embedded data to be more evenly distributed.',
        n_components: 'The dimension of the space to embed into.',
        n_jobs: 'The number of parallel jobs to run for neighbors search. -1 means using all processors.',
        metric: 'The metric to use when calculating distance between instances in a feature array.',
        random_state: 'The seed used by the random number generator. If random_state is used, n_jobs will be ignored.',
    };

    async function compute_umap_embedding() {
        console.log('UMAP embedding');
        if (!loaded_files) {
            toast.error('Please load the necessary files');
            return;
        }

        const vec_processed_dir = await path.dirname(loaded_files.final_processed_file.value);
        const label_issues_file = await path.join(vec_processed_dir, `label_issues_${$cleanlab.model}.parquet`);
        return {
            pyfile: 'training.umap',
            args: {
                n_neighbors: params.n_neighbors,
                min_dist: params.min_dist,
                n_components: params.n_components,
                umap_metric: params.umap_metric,
                n_jobs: params.n_jobs,
                scale_embedding: params.scale_embedding,
                annotate_clusters: params.annotate_clusters,
                label_issues_file: params.use_cleaned_data ? label_issues_file : null,
                processed_df_file: loaded_files.final_processed_file.value,
                columnX: loaded_files.columnX.value,
                dbscan_eps: params.dbscan_eps,
                dbscan_min_samples: params.dbscan_min_samples,
                random_state: params.random_state_locked ? null : params.random_state,
                training_filename: loaded_files.training_file.basename,
            },
        };
    }

    let params = {
        n_neighbors: 15,
        min_dist: 0.1,
        n_components: 2,
        n_jobs: -1,
        umap_metric: 'euclidean',
        random_state: 42,
        scale_embedding: true,
        use_cleaned_data: false,
        annotate_clusters: true,
        dbscan_eps: 0.5,
        dbscan_min_samples: 5,
        random_state_locked: false,
    };
    const default_params = structuredClone(params);
    let umap_loc: string = '';

    const get_umap_loc = async (processed_df_file: string) => {
        if (!processed_df_file) return;
        const dir = await path.dirname(processed_df_file);
        umap_loc = await path.join(dir, 'umap');
        if (!(await fs.exists(umap_loc))) await fs.mkdir(umap_loc);
    };
    $: get_umap_loc(loaded_files?.final_processed_file?.value);
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>UMAP - embedder</h2>

    <LoadedFileInfos on:refresh={e => (loaded_files = e.detail)} />
    <div class="divider"></div>
    <SaveAndLoadState loc={umap_loc} {default_params} bind:params unique_ext={'.umap.json'} />
    <div class="text-xl">Basic UMAP Parameters</div>
    <div class="flex-gap items-start">
        <CustomInput
            bind:value={params.n_neighbors}
            type="number"
            label="n_neighbors"
            hoverHelper={params_description.n_neighbors}
            helperHighlight="default: 15"
        />
        <CustomInput
            bind:value={params.min_dist}
            type="number"
            label="min_dist"
            hoverHelper={params_description.min_dist}
            helperHighlight="default: 0.1"
            step="0.1"
            min="0.1"
        />
        <CustomInput
            bind:value={params.n_components}
            type="number"
            label="n_components"
            hoverHelper={params_description.n_components}
            helperHighlight="default: 2"
        />
        <CustomSelect
            bind:value={params.umap_metric}
            label="metric"
            items={umap_metrics}
            hoverHelper={params_description.metric}
            helperHighlight="default: euclidean"
        />
        <CustomInput bind:value={params.n_jobs} type="number" label="n_jobs" hoverHelper={params_description.n_jobs} />
        <CustomInput
            bind:value={params.random_state}
            type="number"
            label="random_state"
            hoverHelper={params_description.random_state}
            helperHighlight="default: 42"
            bind:lock={params.random_state_locked}
        />
    </div>

    <div class="flex-gap">
        <Checkbox bind:value={params.scale_embedding} label="Scale embedding" />
        <Checkbox bind:value={params.use_cleaned_data} label="Use cleaned data" />
    </div>

    <div class="text-md">DBSCAN Clustering</div>
    <div class="flex-gap">
        <CustomInput
            bind:value={params.dbscan_eps}
            type="number"
            label="eps"
            helperHighlight="default: 0.5"
            min="0.1"
            step="0.1"
            hoverHelper={'Maximum distance between two points for them to be considered neighbors'}
        />
        <CustomInput
            bind:value={params.dbscan_min_samples}
            type="number"
            label="min_samples"
            helperHighlight="default: 5"
            hoverHelper={'Minimum number of points required to form a dense region (cluster)'}
        />
        <Checkbox bind:value={params.annotate_clusters} label="Annotate clusters" />
    </div>

    <div class="m-auto">
        <Loadingbtn callback={compute_umap_embedding} subprocess={true} />
    </div>
</div>
