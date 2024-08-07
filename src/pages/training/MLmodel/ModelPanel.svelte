<script lang="ts">
    import {
        hyperparameters,
        parameters,
        model,
        default_param_values,
        current_model,
        default_parameter_mode,
    } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { RotateCcw, Save, Upload } from 'lucide-svelte/icons';
    import ModelParameters from './ModelParameters.svelte';
    import Notification from '$lib/components/Notification.svelte';
    import { Checkbox } from '$lib/components';
    import ModelTab from './ModelTab.svelte';

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

        const save_content = JSON.stringify(
            {
                values: { hyperparameters: $hyperparameters[$model], parameters: $parameters[$model] },
                model: $model,
                time: new Date().toISOString(),
            },
            null,
            4,
        );
        await fs.writeTextFile(savedfile, save_content);
        toast.success('Parameters saved successfully');
    };

    const upload_parameters = async () => {
        const selected = await dialog.open({
            title: 'Upload parameters',
            filters: [{ name: 'JSON', extensions: ['json'] }],
            defaultPath: `./${$model}.json`,
        });
        let uploadloc = selected;
        if (Array.isArray(selected)) {
            uploadloc = selected[0];
        } else if (selected === null) {
            return;
        } else {
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

            $hyperparameters[$model] = parsed.values.hyperparameters;
            $parameters[$model] = parsed.values.parameters;
            toast.success('Parameters uploaded successfully');
        } catch (e) {
            toast.error('Error: Invalid JSON file');
        }
    };

    const reset_parameters = () => {
        uploadedfile = null;
        $hyperparameters[$model] = structuredClone($default_param_values.hyperparameters);
        $parameters[$model] = structuredClone($default_param_values.parameters);
    };
</script>

<CustomPanel title="MODEL: {$current_model.name}" open={true}>
    <div class="grid gap-2">
        <ModelTab />
        <span class="text-sm">{$current_model.description}</span>
        {#if $current_model}
            <div class="flex">
                <h3>
                    <span>Hyperparameters</span>
                    {#if uploadedfile && uploadedfile.model === $model}
                        <div class="badge badge-sm badge-info">loaded: {uploadedfile.name}</div>
                    {/if}
                </h3>
                <div class="flex gap-2 ml-auto">
                    <Checkbox bind:value={$default_parameter_mode} label="defaults" />
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

    {#if $hyperparameters?.[$model]}
        <ModelParameters key="hyperparameters" bind:values={$hyperparameters[$model]} />
    {:else}
        <Notification message="No hyperparameters found" type="error" />
    {/if}
</CustomPanel>
