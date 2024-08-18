<script lang="ts">
    import { atoms_bin_size, post_analysis_files_directory } from './plot-analysis/stores';
    import { training_column_name_X, training_file, analysis_filename } from './stores';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import { use_dask } from '$lib/stores/system';
    import PlotAnalysis from './plot-analysis/PlotAnalysis.svelte';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import CheckFileStatus from './CheckFileStatus.svelte';

    const MolecularAnalysis = async (
        mode: 'all' | 'size_distribution' | 'structural_distribution' | 'elemental_distribution' = 'all',
    ) => {
        console.log('MolecularAnalysis');
        const analysis_file = await path.join(await $post_analysis_files_directory, analysis_filename);
        const analysis_file_exists = await fs.exists(analysis_file);

        if (!analysis_file_exists) {
            use_analysis_file = false;
        }

        if (analysis_file_exists && !use_analysis_file) {
            const val = await dialog.confirm(
                `${analysis_file} file exists. Do you want to use it?`,
                'Analysis file exists',
            );
            if (val) {
                use_analysis_file = true;
            }
        }

        return {
            pyfile: 'training.molecular_analysis',
            args: {
                filename: $training_file.filename,
                filetype: $training_file.filetype,
                key: $training_file.key,
                use_dask: $use_dask,
                smiles_column_name: $training_column_name_X,
                analysis_file: use_analysis_file ? analysis_file : null,
                atoms_bin_size: Number($atoms_bin_size),
                mode,
            },
        };
    };

    setContext('MolecularAnalysis', MolecularAnalysis);

    const onResult = (e: CustomEvent) => {
        console.log(e.detail);
        const { dataFromPython } = e.detail;
        if (!dataFromPython) return;
        console.log(dataFromPython);
    };

    let loading = false;
    let use_analysis_file = true;
</script>

{#if $training_column_name_X.toLocaleLowerCase() !== 'smiles'}
    <div class="alert alert-error">
        The column X is not 'SMILES'. Please make sure the column X name is 'SMILES' for molecular structure in the
        loaded file: {$training_file.filename}
    </div>
{:else}
    <div class="badge badge-info">
        Using {$training_column_name_X} column for molecular structure
    </div>
{/if}
<Checkbox bind:value={use_analysis_file} label="Use analysis file" check="checkbox" />
<CheckFileStatus name={analysis_filename} />

<Loadingbtn
    class="m-auto"
    bind:loading
    name="Begin full analysis"
    subprocess={true}
    callback={() => MolecularAnalysis('all')}
    on:result={onResult}
/>
<hr />

<PlotAnalysis />
