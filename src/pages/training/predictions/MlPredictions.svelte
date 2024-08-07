<script lang="ts">
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import Molecule from '$lib/components/Molecule.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { CustomSelect } from '$lib/components';
    import { embeddings, model_and_pipeline_files } from '../embedding/stores';
    import axios, { type CancelTokenSource } from 'axios';
    // import { X } from 'lucide-svelte/icons';

    export let id: string = 'ml-predictions';
    export let display: string = 'none';

    let source: CancelTokenSource;

    const predict = async () => {
        if (!$molecular_embedder) {
            toast.error('molecular_embedder not found');
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

        if (!(await fs.exists($model_and_pipeline_files[$molecular_embedder].model_file))) {
            toast.error('Please select a pretrained model');
            return;
        }

        if ($use_PCA && !(await fs.exists($model_and_pipeline_files[$molecular_embedder].pipeline_file))) {
            toast.error('Please select a PCA pipeline');
            return;
        }

        predicted_value = 'Computing...';
        const args = {
            smiles: $smiles,
            molecular_embedder: {
                name: $molecular_embedder,
                file: $model_and_pipeline_files[$molecular_embedder].model_file,
                pipeline_file: $use_PCA ? $model_and_pipeline_files[$molecular_embedder].pipeline_file : null,
            },
            pretrained_model_file: $pretrained_model_file,
        };
        const pyfile = 'training.ml_prediction';
        return { pyfile, args };
    };

    const onResult = (e: CustomEvent) => {
        const { dataFromPython } = e.detail;
        if (!dataFromPython) {
            predicted_value = 'Error';
        } else {
            predicted_value = dataFromPython.predicted_value;
        }
    };

    const pretrained_model_file = localWritable('ml_prediction_pretrained_model_file', '');
    const molecular_embedder = localWritable('ml_prediction_molecular_embedder', 'VICGAE');
    const use_PCA = localWritable('ml_prediction_use_PCA', false);

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
    <div class="flex gap-1 items-end">
        <div class="flex-center border-1 border-solid border-rounded p-1">
            <span>PCA</span>
            <input type="checkbox" class="toggle" bind:checked={$use_PCA} />
        </div>
        <CustomSelect label="Embedder" bind:value={$molecular_embedder} items={embeddings} />
        <BrowseFile
            bind:filename={$pretrained_model_file}
            label="Pre-trained model"
            filters={[{ name: 'Model files', extensions: ['pkl'] }]}
        />
    </div>

    <div class="grid grid-cols-4 items-end gap-2">
        <CustomInput class="col-span-3" bind:value={$smiles} label="Enter molecular SMILES" />
        <Loadingbtn name="Compute" callback={predict} on:result={onResult} />
        <!-- <Loadingbtn name="Compute" callback={predict} on:result={onResult} subprocess={true} /> -->
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
