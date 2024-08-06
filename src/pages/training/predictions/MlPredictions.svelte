<script lang="ts">
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import Molecule from '$lib/components/Molecule.svelte';

    export let id: string = 'ml-predictions';
    export let display: string = 'none';

    const predict = async () => {
        console.log('predict');
        predicted_value = '0.5';
    };

    let pretrained_model = '';
    const smiles = localWritable(
        'ml_prediction_molecular_smiles',
        'COP(=S)(OC)OC1=CC=C(C=C1)SC2=CC=C(C=C2)OP(=S)(OC)OC',
    );
    let predicted_value = '';

    const width = localWritable('ml_prediction_molecular_svg_width', 500);
    const height = localWritable('ml_prediction_molecular_svg_height', 400);
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>Predictions</h2>
    <BrowseFile bind:filename={pretrained_model} label="pretrained_model" />

    <div class="flex items-end gap-4">
        <div class="flex flex-col gap-1">
            <span class="text-xs pl-1">Enter molecular SMILES</span>
            <input
                type="text"
                class="input input-sm w-xl"
                bind:value={$smiles}
                placeholder="Enter SMILES"
                on:change={async () => {
                    if (!$smiles) return;
                }}
            />
        </div>
        <Loadingbtn name="Compute" callback={predict} />
    </div>

    <div class="flex items-start gap-1">
        <Molecule bind:smiles={$smiles} bind:width={$width} bind:height={$height} />
        <CustomInput label="Predicted value" value={predicted_value} />
    </div>
</div>
