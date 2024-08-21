<script lang="ts">
    import {
        atoms_bin_size,
        filtered_dir,
        post_analysis_files_directory,
        structuralDistributionFilter,
        elementalDistributionFilter,
        sizeDistributionFilter,
    } from './plot-analysis/stores';
    import { training_column_name_X, training_file, molecule_analysis_filename } from './stores';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import { use_dask } from '$lib/stores/system';
    import PlotAnalysis from './plot-analysis/PlotAnalysis.svelte';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';

    const MolecularAnalysis = async (
        mode: 'all' | 'size_distribution' | 'structural_distribution' | 'elemental_distribution' = 'all',
    ) => {
        console.log('MolecularAnalysis');

        let analysis_file: string;
        if ($filtered_dir === 'default') {
            analysis_file = $molecule_analysis_filename;
        } else {
            analysis_file = await path.join(
                await $post_analysis_files_directory,
                'filtered',
                $filtered_dir,
                'molecule_analysis_results.csv',
            );
        }
        const analysis_file_exists = await fs.exists(analysis_file);

        if (!analysis_file_exists) {
            use_analysis_file = false;
        }

        if (analysis_file_exists && !use_analysis_file) {
            use_analysis_file = await dialog.confirm(
                `${analysis_file} file exists. Do you want to use it?`,
                'Analysis file exists',
            );
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

    let use_analysis_file = true;

    const ApplyFilterForMolecularAnalysis = async () => {
        console.log('ApplyFilterForMolecularAnalysis');
        const analysis_file_exists = await fs.exists($molecule_analysis_filename);
        if (!analysis_file_exists) {
            toast.error(`${$molecule_analysis_filename} file does not exist`);
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
            analysis_file: $molecule_analysis_filename,
            min_atomic_number,
            max_atomic_number,
            size_count_threshold,
            elemental_count_threshold,
            filter_elements: filter_elements.filter(Boolean),
            filter_structures: filter_structures.filter(Boolean),
            filtered_filename,
        };
        const pyfile = 'training.apply_filter_for_molecular_analysis';
        // console.log(args, pyfile);
        return { pyfile, args };
    };
    let filtered_filename = 'filtered';
</script>

<BrowseFile
    label="Analysis file"
    bind:filename={$molecule_analysis_filename}
    filters={[
        {
            name: 'CSV',
            extensions: ['csv'],
        },
    ]}
/>

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
