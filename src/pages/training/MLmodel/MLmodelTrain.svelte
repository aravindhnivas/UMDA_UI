<script lang="ts">
    import { model, current_model, hyperparameters, parameters, default_param_values, fine_tune_model } from './stores';
    import supervised_ml_models from '$lib/config/supervised_ml_models.yml';
    import { Loadingbtn } from '$lib/components';
    import { RotateCcw, Save, Upload } from 'lucide-svelte/icons';
    import Accordion from '@smui-extra/accordion';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import ModelParameters from './ModelParameters.svelte';
    import Notification from '$lib/components/Notification.svelte';
    import BrowseFile from '$lib/components/BrowseFile.svelte';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import Textfield from '@smui/textfield';
    import computePy from '$lib/pyserver/computePy';
    import { getID } from '$lib/utils/initialise';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    const unique_id = getID();
    setContext('unique_id', unique_id);

    const set_model_params = () => {
        console.log('Setting model params');
        if (!$model) return;
        if (!$current_model) return;

        console.log($hyperparameters, $parameters);
        // Set the default values if they don't exist
        $hyperparameters = structuredClone($default_param_values.hyperparameters);
        $parameters = structuredClone($default_param_values.parameters);
        console.log($hyperparameters, $parameters);

        // Set the pre-trained model filename
        $pre_trained_filename = `${$model}_pretrained_model`;
    };

    onMount(() => {
        set_model_params();
    });

    const fit_function = async (e: Event) => {
        console.log({ hyperparameters: $hyperparameters, parameters: $parameters });
        const values = { ...$hyperparameters, ...$parameters };
        const clonedValues = structuredClone(values);

        $pre_trained_filename = $pre_trained_filename.trim();
        $pre_trained_file_loc = $pre_trained_file_loc.trim();

        if (!(await fs.exists($pre_trained_file_loc))) {
            toast.error('Error: Save location does not exist');
            return;
        }

        const filename = $pre_trained_filename.split('.pkl')[0];
        const pre_trained_file = await path.join($pre_trained_file_loc, filename + '.pkl');

        if (await fs.exists(pre_trained_file)) {
            const overwrite = await dialog.confirm(
                $pre_trained_filename + ': Pre trained model file already exists. Do you want to overwrite it?',
                'Overwrite file',
            );
            if (!overwrite) return;
        }

        Object.entries(values).forEach(([key, value]) => {
            if (value === 'float') {
                const input = document.getElementById(`${unique_id}_${key}`) as HTMLInputElement;

                if (!input) {
                    toast.error(`Error: ${key} input not found`);
                    return;
                }
                const val = parseFloat(input.value);

                if (isNaN(val)) {
                    toast.error(`Error: ${key} input is not a number. Please enter a valid number`);
                    return;
                }

                clonedValues[key] = val;
            } else if (typeof value === 'string' && value.trim() === '') {
                clonedValues[key] = null;
            }
        });

        const args = {
            model: $model,
            parameters: clonedValues,
            vectors_file,
            labels_file,
            bootstrap,
            bootstrap_nsamples,
            test_size: test_size / 100,
            pre_trained_file,
        };

        console.log(args);
        // await computePy({
        //     pyfile: 'training.ml_model',
        //     args,
        //     general: true,
        //     target: e.target as HTMLButtonElement,
        // });
    };

    let savedfile: string;
    let uploadedfile: { fullname: string; name: string; model: string } | null = null;

    const save_parameters = async () => {
        const saveloc = await dialog.save({
            title: 'Save parameters',
            filters: [{ name: 'JSON', extensions: ['json'] }],
            defaultPath: `./${$model}.json`,
        });

        if (!saveloc) return;
        savedfile = saveloc;
        // if (await fs.exists(saveloc)) {
        //     const overwrite = await dialog.confirm(
        //         'File already exists. Do you want to overwrite it?',
        //         'Overwrite file',
        //     );
        //     if (!overwrite) return;
        // }

        const save_content = JSON.stringify(
            {
                values: { hyperparameters: $hyperparameters, parameters: $parameters },
                model: $model,
                time: new Date().toISOString(),
            },
            null,
            4,
        );
        await fs.writeTextFile(savedfile, save_content);

        // Show a success notification
        toast.success('Parameters saved successfully');
    };

    const upload_parameters = async () => {
        // Upload the parameters from the backend
        const selected = await dialog.open({
            title: 'Upload parameters',
            filters: [{ name: 'JSON', extensions: ['json'] }],
            defaultPath: `./${$model}.json`,
        });
        let uploadloc = selected;
        if (Array.isArray(selected)) {
            // user selected multiple files
            uploadloc = selected[0];
        } else if (selected === null) {
            // user cancelled the selection
            return;
        } else {
            // user selected a single file
            uploadloc = selected;
        }

        uploadedfile = null;

        const contents = await fs.readTextFile(uploadloc);
        try {
            const parsed = JSON.parse(contents);

            if ($model !== parsed.model) {
                toast.error('Error: Model mismatch');
                return;
            }
            const basefilename = await path.basename(uploadloc);
            uploadedfile = {
                fullname: uploadloc,
                name: basefilename,
                model: parsed.model,
            };

            $hyperparameters = parsed.values.hyperparameters;
            $parameters = parsed.values.parameters;
            toast.success('Parameters uploaded successfully');
        } catch (e) {
            toast.error('Error: Invalid JSON file');
        }
    };

    const reset_parameters = () => {
        $hyperparameters = structuredClone($default_param_values.hyperparameters);
        $parameters = structuredClone($default_param_values.parameters);
    };

    // let toggle_browse_files = true;
    let vectors_file = '';
    let labels_file = '';
    let bootstrap = false;
    // let fine_tune_mode = false;
    // let more_options = false;
    let bootstrap_nsamples = 800;
    let test_size = 20;
    const pre_trained_file_loc = localWritable('pre_trained_file_loc', '');
    const pre_trained_filename = localWritable('pre_trained_filename', '');
    $: if ($model) set_model_params();
    // console.log(supervised_ml_models);
</script>

<div {id} style:display class="grid content-start gap-2">
    <h2>ML model training</h2>

    <Accordion multiple>
        <CustomPanel title="Browse training files">
            <div class="flex gap-2">
                <BrowseFile
                    btn_name="Browse - X (.npy)"
                    helper="embedded N dimension vectors"
                    bind:filename={vectors_file}
                />
                <BrowseFile btn_name="Browse - Y" helper="single column 1-D labels" bind:filename={labels_file} />
            </div>
        </CustomPanel>

        <CustomPanel title="Control" open={true}>
            <div class="flex gap-2 justify-between">
                <div class="grid gap-1">
                    <input class="range w-xs" type="range" min="5" max="95" step="5" bind:value={test_size} />
                    <span>split: {test_size}% test : {100 - test_size}% train</span>
                    {#if test_size > 50}
                        <div class="badge badge-sm badge-warning">Warning: Test split ratio is greater than 50%</div>
                    {/if}
                </div>

                <div class="flex gap-2 items-center">
                    <Checkbox bind:value={$fine_tune_model} label="fine-tune parameters" />
                    <div class="">
                        <Checkbox bind:value={bootstrap} label="bootstrap" check="checkbox" />
                        {#if bootstrap}
                            <Textfield bind:value={bootstrap_nsamples} label="Number of samples" type="number" />
                        {/if}
                    </div>
                </div>
            </div>
        </CustomPanel>

        <CustomPanel title="MODEL: {$current_model.name}" open={true}>
            <div class="grid gap-2">
                <TabBar tabs={Object.keys(supervised_ml_models)} let:tab bind:active={$model}>
                    <Tab {tab}>
                        <Label><span class="text-black">{tab}</span></Label>
                    </Tab>
                </TabBar>
                <span class="text-sm">{$current_model.description}</span>
                {#if $current_model}
                    <div class="flex">
                        <h3>
                            Hyperparameters
                            {#if uploadedfile && uploadedfile.model === $model}
                                <div class="badge badge-sm badge-info">loaded: {uploadedfile.name}</div>
                            {/if}
                        </h3>
                        <div class="ml-auto">
                            <button class="btn btn-sm" on:click={reset_parameters}>
                                <RotateCcw />
                                <span>Reset</span>
                            </button>
                            <button class="btn btn-sm" on:click={upload_parameters}>
                                <Upload />
                                <span>Upload</span>
                            </button>
                            <button class="btn btn-sm" on:click={save_parameters}>
                                <Save />
                                <span>Save</span>
                            </button>
                        </div>
                    </div>
                {/if}
            </div>

            {#if $hyperparameters}
                <ModelParameters key="hyperparameters" bind:values={$hyperparameters} />
            {:else}
                <Notification message="No hyperparameters found" type="error" />
            {/if}
        </CustomPanel>
        <CustomPanel title="More options">
            {#if $parameters}
                <ModelParameters key="parameters" bind:values={$parameters} />
            {:else}
                <Notification message="No parameters found" type="error" />
            {/if}
        </CustomPanel>
        <CustomPanel title="Save Model">
            <div class="grid gap-2">
                <BrowseFile directory={true} bind:filename={$pre_trained_file_loc} label="Save trained model" />
                <Textfield bind:value={$pre_trained_filename} label="save filename (.pkl)" />
            </div>
        </CustomPanel>
    </Accordion>
    <Loadingbtn class="w-lg m-auto " name="Compute" callback={fit_function} subprocess={true} />
</div>
