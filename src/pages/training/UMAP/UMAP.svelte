<script lang="ts">
    import { cleanlab } from './../MLmodel/stores';
    import { umap_metrics } from './stores';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import LoadedFileInfos from '../embedding/LoadedFileInfos.svelte';
    import SaveAndLoadState from '$lib/components/SaveAndLoadState.svelte';
    import Plot from 'svelte-plotly.js';

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
                fig_title: params.fig_title,
            },
        };
    }

    const get_save_fname = async (params: Record<string, string | number | boolean>) => {
        const extname = await path.extname(loaded_files.training_file.basename);
        save_fname = loaded_files.training_file.basename.replace(`.${extname}`, '');
        if (params.scale_embedding) save_fname += '_scaled';
        if (!params.random_state_locked) save_fname += `_random_state_${params.random_state}`;
        save_fname += `_umap_${params.n_neighbors}_${params.min_dist}_${params.n_components}`;
        save_fname += `_cluster_eps_${params.dbscan_eps}_min_samples_${params.dbscan_min_samples}`;
        return save_fname;
    };

    const get_umap_dir = async (file: string, cleaned: boolean) => {
        const processed_dir = await path.dirname(file);
        umap_dir = await path.join(processed_dir, 'umap');
        if (cleaned) {
            umap_dir = await path.join(umap_dir, `cleaned_label_issues_${$cleanlab.model}`);
        }
        return umap_dir;
    };

    let save_fname: string = '';
    $: loaded_files?.training_file?.basename && get_save_fname(params);
    let umap_dir: string = '';
    $: loaded_files?.final_processed_file?.value &&
        get_umap_dir(loaded_files.final_processed_file.value, params.use_cleaned_data);

    $: path.join(umap_dir, `[plotly_data]_${save_fname}.json`).then(res => {
        plotly_data_file = res;
    });

    let params: Record<string, string | number | boolean> = {
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
        fig_title: '',
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

    let plotly_data: Plotly.Data[];
    let plotly_layout: Plotly.Layout;
    let plotly_data_file: string = '';

    const plot_from_json = async (data_json_file: string) => {
        if (!(await fs.exists(data_json_file))) return;
        const contents = await readJSON<{ data: Plotly.Data[]; layout: Plotly.Layout }>(data_json_file);
        if (!contents) return;
        const { data, layout } = contents;
        plotly_data = data;
        plotly_layout = layout;
    };

    const onResult = async (e: CustomEvent) => {
        console.log(e.detail);
        const { dataFromPython } = e.detail;
        if (!dataFromPython) return;
        plotly_data_file = dataFromPython.plotly_data_file;
        const contents = await readJSON<{ data: Plotly.Data[]; layout: Plotly.Layout }>(plotly_data_file);
        if (!contents) return;
        plot_from_json(plotly_data_file);
    };
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
    <div class="flex-gap items-start">
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
    </div>

    <div class="flex-gap">
        <CustomInput bind:value={params.fig_title} label="title" helper={'Figure title'} />
        <Checkbox bind:value={params.annotate_clusters} label="Annotate clusters" />
    </div>

    <div class="flex-gap m-auto">
        <Loadingbtn callback={compute_umap_embedding} subprocess={true} on:result={onResult} />
        <button
            class="btn btn-sm btn-outline"
            on:click={async () => {
                const file_exists = await fs.exists(plotly_data_file);
                if (!file_exists) return toast.error('Plot not available');
                await plot_from_json(plotly_data_file);
            }}>{plotly_data_file ? 'Plot ready' : 'Plot not available'}</button
        >
    </div>

    <div style="height: 800px;">
        {#if plotly_data && plotly_layout}
            <Plot data={plotly_data} layout={plotly_layout} fillParent={true} debounce={250} />
        {/if}
    </div>
    <div class="divider"></div>
</div>
