<script lang="ts">
    import {
        atoms_bin_size,
        filtered_dir,
        structuralDistributionFilter,
        elementalDistributionFilter,
        sizeDistributionFilter,
        current_analysis_file,
    } from './plot-analysis/stores';
    import { training_column_name_X, training_file, molecule_analysis_file } from './stores';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import { use_dask } from '$lib/stores/system';
    import PlotAnalysis from './plot-analysis/PlotAnalysis.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';

    const MolecularAnalysis = async (
        mode: 'all' | 'size_distribution' | 'structural_distribution' | 'elemental_distribution' = 'all',
    ) => {
        console.log('MolecularAnalysis', { $filtered_dir });
        const analysis_file = await $current_analysis_file;
        const analysis_file_exists = await fs.exists(analysis_file);
        console.log('Checking analysis file', analysis_file, analysis_file_exists);

        return {
            pyfile: 'training.molecular_analysis',
            args: {
                filename: $training_file.filename,
                filetype: $training_file.filetype,
                key: $training_file.key,
                use_dask: $use_dask,
                smiles_column_name: $training_column_name_X,
                analysis_file: analysis_file_exists ? analysis_file : null,
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

    const ApplyFilterForMolecularAnalysis = async () => {
        console.log('ApplyFilterForMolecularAnalysis');

        if ($filtered_dir !== 'default') {
            toast.error('Filters can only be applied to the default directory');
            return;
        }
        const analysis_file = await $molecule_analysis_file;
        const analysis_file_exists = await fs.exists(analysis_file);
        if (!analysis_file_exists) {
            toast.error(`${analysis_file} file does not exist`);
            return;
        }

        console.log($structuralDistributionFilter, $elementalDistributionFilter, $sizeDistributionFilter);

        let min_atomic_number = null;
        if (!$sizeDistributionFilter.min_atomic_number.lock) {
            min_atomic_number = $sizeDistributionFilter.min_atomic_number.value;
        }

        let max_atomic_number = null;
        if (!$sizeDistributionFilter.max_atomic_number.lock) {
            max_atomic_number = $sizeDistributionFilter.max_atomic_number.value;
        }

        let size_count_threshold = null;
        if (!$sizeDistributionFilter.count_threshold.lock) {
            size_count_threshold = $sizeDistributionFilter.count_threshold.value;
        }

        let elemental_count_threshold = null;
        if (!$elementalDistributionFilter.count_threshold.lock) {
            elemental_count_threshold = $elementalDistributionFilter.count_threshold.value;
        }

        const filter_elements = $elementalDistributionFilter.filter_elements;
        const filter_structures = $structuralDistributionFilter.filter_structures;

        const args = {
            analysis_file,
            min_atomic_number,
            max_atomic_number,
            size_count_threshold,
            elemental_count_threshold,
            filter_elements: filter_elements.filter(Boolean),
            filter_structures: filter_structures.filter(Boolean),
            filtered_filename,
        };
        const pyfile = 'training.apply_filter_for_molecular_analysis';
        return { pyfile, args };
    };
    let filtered_filename = 'filtered';
</script>

{#await $molecule_analysis_file then value}
    <div class="badge badge-info">{value}</div>
{/await}

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

<div class="flex gap-2 m-auto items-end">
    <Loadingbtn
        name="Begin full analysis"
        subprocess={true}
        callback={() => MolecularAnalysis('all')}
        on:result={onResult}
    />
    <Loadingbtn
        name="Apply filters"
        subprocess={true}
        callback={() => ApplyFilterForMolecularAnalysis()}
        on:result={e => console.log(e.detail)}
    />
    <CustomInput bind:value={filtered_filename} label="Enter filter name" />
</div>

<hr />

<PlotAnalysis />
