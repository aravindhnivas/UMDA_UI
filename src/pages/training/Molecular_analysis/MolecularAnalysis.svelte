<script lang="ts">
    import CustomInput from '$lib/components/CustomInput.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import Molecule from '$lib/components/Molecule.svelte';
    import Chip, { Set, Text } from '@smui/chips';
    import PropertiesBox from './PropertiesBox.svelte';

    export let id = 'molecular-analysis-main-data-container';
    export let display = 'none';

    let smiles = 'CCO';
    // let key_properties: string[] = [];

    const all_properties = [
        'basic_properties',
        'ring_information',
        'chain_information',
        'aromaticity',
        'functional_groups',
        'physicochemical_properties',
        'heterocyclicity',
    ];
    let selected_properties: string[] = ['basic_properties', 'ring_information', 'chain_information'];

    let full_analysis: Record<string, any> = {};

    const compute_molecular_analysis = async () => {
        if (!smiles) return toast.error('Please provide a SMILES string');
        // console.log('Analyse', smiles);
        return {
            pyfile: 'utils.molecular_analyzer',
            args: {
                smiles,
            },
        };
    };

    const onResult = (e: CustomEvent) => {
        if (!e.detail) return;
        const { dataFromPython } = e.detail;
        full_analysis = dataFromPython.full_analysis;
    };

    let compute_btn: HTMLButtonElement | undefined = undefined;
</script>

<div class="grid content-start gap-2 pr-5" {id} style:display>
    <div class="text-xl font-bold">Molecular Analysis</div>

    <CustomInput
        label="SMILES"
        bind:value={smiles}
        on:change={() => {
            if (!smiles) return;
            compute_btn?.click();
        }}
    />

    <Molecule bind:smiles show_controls={false} />

    <div class="divider"></div>
    <div class="m-auto">
        <Loadingbtn bind:btn={compute_btn} name="Analyse" callback={compute_molecular_analysis} on:result={onResult} />
    </div>
    <div class="divider"></div>

    <Set chips={all_properties} let:chip filter bind:selected={selected_properties}>
        <Chip {chip} touch>
            <Text>{chip}</Text>
        </Chip>
    </Set>

    <div class="divider"></div>

    {#if !isEmpty(full_analysis)}
        <PropertiesBox {selected_properties} {full_analysis} {all_properties} />
    {:else}
        <div class="text-center">No data to display</div>
    {/if}
</div>
