<script lang="ts">
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

<Loadingbtn
    class="m-auto"
    bind:loading
    name="Begin analysis"
    subprocess={true}
    callback={MolecularAnalysis}
    on:result={onResult}
/>
