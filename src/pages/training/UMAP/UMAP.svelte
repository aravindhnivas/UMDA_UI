<script lang="ts">
    import { cleanlab } from './../MLmodel/stores';
    import { umap_metrics } from './stores';
    import { parquetRead } from 'hyparquet';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import LoadedFileInfos from '../embedding/LoadedFileInfos.svelte';

    export let id: string = 'umap-embedder-container';
    export let display: string = 'none';

    let loaded_files: LoadedInfosFile;

    let n_neighbors: number = 15;
    let min_dist: number = 0.1;
    let n_components: number = 2;
    let n_jobs: number = -1;
    let umap_metric: string = 'euclidean';
    let random_state: number = 42;

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

    let random_state_locked: boolean = false;
    let scale_embedding = false;
    let use_cleaned_data = false;

    let dbscan_eps: number = 0.5;
    let dbscan_min_samples: number = 5;

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
                n_neighbors,
                min_dist,
                n_components,
                umap_metric,
                n_jobs,
                scale_embedding,
                // use_cleaned_data,
                label_issues_file: use_cleaned_data ? label_issues_file : null,
                processed_df_file: loaded_files.final_processed_file.value,
                columnX: loaded_files.columnX.value,
                dbscan_eps,
                dbscan_min_samples,
                random_state: random_state_locked ? null : random_state,
                training_filename: loaded_files.training_file.basename,
            },
        };
    }
    let reading_parquet = false;

    const read_parquet = async (filename: string) => {
        if (!(await fs.exists(filename))) {
            toast.error('File does not exist');
            return;
        }
        reading_parquet = true;
        const buffer = await fs.readFile(filename);
        const arrayBuffer = new Uint8Array(buffer).buffer;

        if (arrayBuffer.byteLength === 0) {
            toast.error('Empty file');
            reading_parquet = false;
            return;
        }
        await parquetRead({
            file: arrayBuffer,
            onComplete: data => {
                // console.log(data);
                console.log('File read successfully', data.length, data[0]);
                reading_parquet = false;
            },
        });
    };
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>UMAP - embedder</h2>
    <LoadedFileInfos on:refresh={e => (loaded_files = e.detail)} />
    <div class="flex-gap">
        <button
            class="btn btn-sm"
            class:btn-disabled={reading_parquet}
            on:click={async () => {
                await read_parquet(loaded_files.final_processed_file.value);
            }}
        >
            <span>Read Parquet file</span>
            {#if reading_parquet}
                <span class="loading loading-dots loading-sm"></span>
            {/if}
        </button>
    </div>
    <div class="divider"></div>

    <div class="text-xl">Basic UMAP Parameters</div>
    <div class="flex-gap items-start">
        <CustomInput
            bind:value={n_neighbors}
            type="number"
            label="n_neighbors"
            hoverHelper={params_description.n_neighbors}
            helperHighlight="default: 15"
        />
        <CustomInput
            bind:value={min_dist}
            type="number"
            label="min_dist"
            hoverHelper={params_description.min_dist}
            helperHighlight="default: 0.1"
            step="0.01"
        />
        <CustomInput
            bind:value={n_components}
            type="number"
            label="n_components"
            hoverHelper={params_description.n_components}
            helperHighlight="default: 2"
        />
        <CustomSelect
            bind:value={umap_metric}
            label="metric"
            items={umap_metrics}
            hoverHelper={params_description.metric}
            helperHighlight="default: euclidean"
        />
        <CustomInput bind:value={n_jobs} type="number" label="n_jobs" hoverHelper={params_description.n_jobs} />
        <CustomInput
            bind:value={random_state}
            type="number"
            label="random_state"
            hoverHelper={params_description.random_state}
            helperHighlight="default: 42"
            bind:lock={random_state_locked}
        />
    </div>

    <div class="flex-gap">
        <Checkbox bind:value={scale_embedding} label="Scale embedding" />
        <Checkbox bind:value={use_cleaned_data} label="Use cleaned data" />
    </div>

    <div class="text-md">DBSCAN Clustering</div>
    <div class="flex-gap">
        <CustomInput
            bind:value={dbscan_eps}
            type="number"
            label="eps"
            helperHighlight="default: 0.5"
            hoverHelper={'Maximum distance between two points for them to be considered neighbors'}
        />
        <CustomInput
            bind:value={dbscan_min_samples}
            type="number"
            label="min_samples"
            helperHighlight="default: 5"
            hoverHelper={'Minimum number of points required to form a dense region (cluster)'}
        />
    </div>

    <div class="m-auto">
        <Loadingbtn callback={compute_umap_embedding} subprocess={true} />
    </div>
</div>
