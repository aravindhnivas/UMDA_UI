<script lang="ts">
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import computePy from '$lib/pyserver/computePy';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import { embeddings } from '../embedding/stores';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    // import Paper, { Content } from '@smui/paper';
    // import { Code2 } from 'lucide-svelte/icons';
    import Plot from 'svelte-plotly.js/Plot.svelte';
    // import * as hdf5 from 'jsfive';

    export let id: string = 'pca-train-container';
    export let display: string = 'none';

    let explained_variance_data: { x: number[]; y: number[] }[] = [];
    let cumulative_variance_data: { x: number[]; y: number[] }[] = [];
    const explained_variance_file = writable_store('pca-explained-variance-file', '');

    const read_file = async (filename: string) => {
        const explained_varience_read = (await fs.readTextFile(filename)) as string;
        const explained_varience = explained_varience_read
            .split('\n')
            .map(x => parseFloat(x))
            .filter(x => x);
        let cumulative_variance: number[] = [];
        explained_varience.forEach((x, i) => {
            if (i === 0) {
                cumulative_variance.push(x);
            } else {
                cumulative_variance.push(cumulative_variance[i - 1] + x);
            }
        });
        console.warn('File read', { explained_varience, cumulative_variance });
        explained_variance_data = [
            {
                x: Array.from({ length: explained_varience.length }, (_, i) => i),
                y: explained_varience,
            },
        ];
        cumulative_variance_data = [
            {
                x: Array.from({ length: explained_varience.length }, (_, i) => i),
                y: cumulative_variance,
            },
        ];
    };

    // read_file().then(() => console.log('done'));
    const active = writable_store('pca-active-tab', 'Training');

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
    <div>
        <TabBar tabs={['Training', 'Analysis']} let:tab bind:active={$active}>
            <Tab {tab}>
                <Label>{tab}</Label>
            </Tab>
        </TabBar>
    </div>
    {#if $active === 'Training'}
        <div class="grid">
            <h2>Principal component analysis</h2>
            <span class="text-sm">A linear dimensionality reduction technique</span>
        </div>

        <CustomSelect class="w-max" label="Choose model" bind:value={original_model} items={embeddings} />
        <BrowseFile
            bind:filename={$pca_model_and_npy_files[original_model].model_file}
            btn_name={'Browse model (.pkl)'}
        />
        <BrowseFile
            bind:filename={$pca_model_and_npy_files[original_model].npy_file}
            btn_name={'Browse vectors (.npy)'}
        />

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
    {:else if $active === 'Analysis'}
        <BrowseFile
            bind:filename={$explained_variance_file}
            btn_name={'Browse explained_variance'}
            load_callback={read_file}
        />
        <div class="flex gap-1 mt-5">
            <div class="grid">
                <h2>Scree plot</h2>
                <div class="plot w-[700px] h-lg">
                    <Plot
                        data={explained_variance_data}
                        layout={{
                            xaxis: { title: 'Number of components' },
                            yaxis: { title: 'Explained variance' },
                            margin: { t: 0 },
                        }}
                        fillParent={true}
                        debounce={250}
                    />
                </div>
            </div>

            <div class="grid">
                <!-- {cumulative_variance_data[0]} -->
                <h2>
                    Cumulative explained variance ({cumulative_variance_data[0]
                        ? Number(cumulative_variance_data[0].y.at(-1) * 100).toFixed(0)
                        : ''} %)
                </h2>
                <div class="plot w-[700px] h-lg">
                    <Plot
                        data={cumulative_variance_data}
                        layout={{
                            xaxis: { title: 'Number of components' },
                            yaxis: { title: 'Cumulative explained variance' },
                            margin: { t: 0 },
                        }}
                        fillParent={true}
                        debounce={250}
                    />
                </div>
            </div>
        </div>
    {/if}
</div>
