<script lang="ts">
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import Molecule from '$lib/components/Molecule.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { Checkbox } from '$lib/components';

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

        if (test_mode && !$smiles) {
            toast.error('Enter molecular SMILES');
            return;
        }

        if (!test_mode && !(await fs.exists($prediction_file))) {
            toast.error('Please select a test file');
            return;
        }

        if (test_mode) predicted_value = 'Computing...';
        const args = {
            smiles: $smiles,
            pretrained_model_file: $pretrained_model_file,
            prediction_file: test_mode ? null : $prediction_file,
        };
        const pyfile = 'training.ml_prediction';
        return { pyfile, args };
    };

    const onResult = (e: CustomEvent) => {
        const { dataFromPython } = e.detail;
        console.log(dataFromPython);
        if (!test_mode) {
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
    let test_mode = true;
    const prediction_file = localWritable('ml_prediction_file', '');

    const smiles = localWritable(
        'ml_prediction_molecular_smiles',
        'COP(=S)(OC)OC1=CC=C(C=C1)SC2=CC=C(C=C2)OP(=S)(OC)OC',
    );

    let predicted_value: number | string = '';
    const width = localWritable('ml_prediction_molecular_svg_width', 500);
    const height = localWritable('ml_prediction_molecular_svg_height', 400);
</script>

<Checkbox class="ml-auto" label="Test mode" bind:value={test_mode} />
<BrowseFile
    bind:filename={$pretrained_model_file}
    label="Pre-trained model"
    filters={[{ name: 'Model files', extensions: ['pkl'] }]}
/>
{#if !test_mode}
    <BrowseFile
        bind:filename={$prediction_file}
        label="upload file to predict"
        filters={[{ name: 'SMILES files', extensions: ['smi', 'csv'] }]}
    />
{/if}

<div class="grid grid-cols-5 items-end gap-2">
    {#if test_mode}
        <CustomInput class="col-span-3" bind:value={$smiles} label="Enter molecular SMILES" />
    {/if}
    <Loadingbtn callback={predict} on:result={onResult} subprocess={!test_mode} />
</div>

{#if test_mode}
    <div class="flex items-start gap-1">
        <Molecule bind:smiles={$smiles} bind:width={$width} bind:height={$height} />
        <div class="grid gap-2">
            <div class="text-sm">Predicted value</div>
            <div class="rounded-1 p-1" style="background-color: antiquewhite;">
                <span class="select-text">
                    {isNumber(predicted_value) ? predicted_value.toFixed(2) : predicted_value}
                </span>
            </div>
        </div>
    </div>
{/if}
