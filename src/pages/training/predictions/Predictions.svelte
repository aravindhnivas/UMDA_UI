<script lang="ts">
    import { model_and_pipeline_files } from '../embedding/stores';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import Molecule from '$lib/components/Molecule.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';

    const predict = async () => {
        const basename = await path.basename($pretrained_model_file);
        if (!basename.split('.')[0]) {
            toast.error('Invalid pretrained_model filename');
            return;
        }

        if (!(await fs.exists($pretrained_model_file))) {
            toast.error('pretrained_model file not found');
            return;
        }

        if (!use_file && !$smiles) {
            toast.error('Enter molecular SMILES');
            return;
        }

        if (use_file && !(await fs.exists($test_file))) {
            toast.error('Please select a test file');
            return;
        }

        if (!use_file) predicted_value = 'Computing...';
        const args = {
            smiles: $smiles,
            pretrained_model_file: $pretrained_model_file,
            test_file: use_file ? $test_file : null,
        };
        const pyfile = 'training.ml_prediction';
        return { pyfile, args };
    };

    const onResult = (e: CustomEvent) => {
        const { dataFromPython } = e.detail;
        console.log(dataFromPython);
        if (use_file) {
            if (!dataFromPython.savedfile) {
                toast.error('Error in prediction, check logs');
                return;
            }
            toast.success('Prediction completed, file saved' + dataFromPython.savedfile);
            return;
        }

        if (!dataFromPython) {
            predicted_value = 'Error';
        } else {
            predicted_value = dataFromPython.predicted_value;
        }
    };

    const pretrained_model_file = localWritable('ml_prediction_pretrained_model_file', '');
    const test_file = localWritable('ml_prediction_test_file', '');
    let use_file = true;

    const smiles = localWritable(
        'ml_prediction_molecular_smiles',
        'COP(=S)(OC)OC1=CC=C(C=C1)SC2=CC=C(C=C2)OP(=S)(OC)OC',
    );
    let predicted_value: number | string = '';

    const width = localWritable('ml_prediction_molecular_svg_width', 500);
    const height = localWritable('ml_prediction_molecular_svg_height', 400);
</script>

<BrowseFile
    bind:filename={$pretrained_model_file}
    label="Pre-trained model"
    filters={[{ name: 'Model files', extensions: ['pkl'] }]}
/>
<BrowseFile
    bind:filename={$test_file}
    label="upload test file"
    filters={[{ name: 'SMILES files', extensions: ['smi', 'csv'] }]}
/>

<div class="grid grid-cols-5 items-end gap-2">
    <div class="flex-center border-1 border-solid border-rounded p-1">
        <span>USE test-file</span>
        <input type="checkbox" class="toggle" bind:checked={use_file} />
    </div>
    {#if !use_file}
        <CustomInput class="col-span-3" bind:value={$smiles} label="Enter molecular SMILES" />
    {/if}
    <Loadingbtn name="Compute" callback={predict} on:result={onResult} subprocess={use_file} />
</div>
{#if !use_file}
    <div class="flex items-start gap-1">
        <Molecule bind:smiles={$smiles} bind:width={$width} bind:height={$height} />
        <div class="grid gap-2">
            <div class="text-sm">Predicted value</div>
            <div class="rounded-1 p-1" style="background-color: antiquewhite;">
                <span class="select-text">{predicted_value}</span>
            </div>
        </div>
    </div>
{/if}
