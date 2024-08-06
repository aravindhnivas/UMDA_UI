<script lang="ts">
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import Molecule from '$lib/components/Molecule.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';

    export let id: string = 'ml-predictions';
    export let display: string = 'none';

    const predict = async () => {
        if (!(await fs.exists($molecular_embedder_file))) {
            toast.error('molecular_embedder file not found');
            return;
        }
        if (!(await fs.exists($pretrained_model_file))) {
            toast.error('pretrained_model file not found');
            return;
        }
        if (!$smiles) {
            toast.error('Enter molecular SMILES');
            return;
        }
        const args = {
            smiles: $smiles,
            molecular_embedder_file: $molecular_embedder_file,
            pretrained_model_file: $pretrained_model_file,
        };
        const pyfile = 'ml_prediction';
        const dataFromPython = await computePy<string | number>({
            pyfile,
            args,
        });
        if (!dataFromPython) return;
        predicted_value = dataFromPython;
    };

    const pretrained_model_file = localWritable('ml_prediction_pretrained_model', '');
    const molecular_embedder_file = localWritable('ml_prediction_molecular_embedder', '');
    const smiles = localWritable(
        'ml_prediction_molecular_smiles',
        'COP(=S)(OC)OC1=CC=C(C=C1)SC2=CC=C(C=C2)OP(=S)(OC)OC',
    );
    let predicted_value: number | string = '';

    const width = localWritable('ml_prediction_molecular_svg_width', 500);
    const height = localWritable('ml_prediction_molecular_svg_height', 400);
</script>

<div class="grid content-start gap-2" {id} style:display>
    <h2>Predictions</h2>
    <BrowseFile bind:filename={$molecular_embedder_file} label="molecular_embedder" />
    <BrowseFile bind:filename={$pretrained_model_file} label="pretrained_model" />

    <div class="grid grid-cols-4 items-end gap-2">
        <CustomInput class="col-span-3" bind:value={$smiles} label="Enter molecular SMILES" />
        <Loadingbtn name="Compute" callback={predict} />
    </div>

    <div class="flex items-start gap-1">
        <Molecule bind:smiles={$smiles} bind:width={$width} bind:height={$height} />
        <div class="grid gap-2">
            <div class="text-sm">Predicted value</div>
            <div class="rounded-1 p-1" style="background-color: antiquewhite;">
                <span class="select-text">{predicted_value}</span>
            </div>
        </div>
    </div>
</div>
