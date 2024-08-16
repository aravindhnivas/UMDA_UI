<script lang="ts">
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import { use_dask } from '$lib/stores/system';
    import { training_column_name_X, training_file } from './stores';

    const MolecularAnalysis = async () => {
        return {
            pyfile: 'training.molecular_analysis',
            args: {
                filename: $training_file.filename,
                filetype: $training_file.filetype,
                key: $training_file.key,
                use_dask: $use_dask,
                smiles_column_name: $training_column_name_X,
                analysis_file: lock_analysis_file ? null : $analysis_file,
                atoms_bin_size: $atoms_bin_size,
            },
        };
    };

    const onResult = (e: CustomEvent) => {
        console.log(e.detail);
        const { dataFromPython } = e.detail;
        if (!dataFromPython) return;
        console.log(dataFromPython);
    };

    let loading = false;
    const analysis_file = localWritable('molecular_analysis_file', '');
    let lock_analysis_file = false;
    const atoms_bin_size = localWritable('atoms_bin_size', 10);
</script>

{#if $training_column_name_X.toLocaleLowerCase() !== 'smiles'}
    <div class="alert alert-error">
        The column X is not 'SMILES'. Please make sure the column X name is 'SMILES' for molecular structure in the
        loaded file: {$training_file.filename}
    </div>
{:else}
    <div class="badge badge-info">
        Using {$training_column_name_X} column for molecular structure in file: {$training_file.filename}
    </div>
{/if}

<BrowseFile
    bind:filename={$analysis_file}
    bind:lock={lock_analysis_file}
    btn_name={'Browse analysis file'}
    label="Optional. Choose analysis file if you have one!"
    filters={[{ name: 'molecule_analysis_results', extensions: ['csv'] }]}
/>

<div class="flex">
    <CustomInput label="Atoms bin size" bind:value={$atoms_bin_size} type="number" placeholder="Enter atoms bin size" />
</div>

<Loadingbtn
    class="m-auto"
    bind:loading
    name="Begin analysis"
    subprocess={true}
    callback={MolecularAnalysis}
    on:result={onResult}
/>
