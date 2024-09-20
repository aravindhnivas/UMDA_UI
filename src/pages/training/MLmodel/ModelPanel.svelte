<script lang="ts">
    import {
        hyperparameters,
        parameters,
        model,
        default_param_values,
        current_model,
        default_parameter_mode,
        all_params_lock_status,
    } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import ModelParameters from './ModelParameters.svelte';
    import Notification from '$lib/components/Notification.svelte';
    import { Checkbox } from '$lib/components';
    import ModelTab from './ModelTab.svelte';
    import { RotateCcw, Save, Download } from 'lucide-svelte/icons';

    let savedfile: string;
    let uploadedfile: { fullname: string; name: string; model: string } | null = null;

    const save_parameters = async () => {
        const saveloc = await dialog.save({
            title: 'Save parameters',
            filters: [{ name: 'JSON', extensions: ['json'] }],
            defaultPath: `./${$model}.parameters.json`,
        });

        if (!saveloc) return;
        savedfile = saveloc;

        let values: Record<string, any> = {};
        typeSafeObjectKeys($all_params_lock_status[$model].hyperparameters).forEach(key => {
            const locked = $all_params_lock_status[$model].hyperparameters[key];
            if (locked) return;
            values[key] = structuredClone($hyperparameters[$model][key]);
        });
        typeSafeObjectKeys($all_params_lock_status[$model].parameters).forEach(key => {
            const locked = $all_params_lock_status[$model].parameters[key];
            if (locked) return;
            values[key] = structuredClone($parameters[$model][key]);
        });
        if (isEmpty(values)) {
            toast.error('No parameters to save');
            return;
        }

        const save_content = JSON.stringify(
            {
                values,
                model: $model,
                timestamp: new Date().toLocaleString(),
            },
            null,
            2,
        );
        await fs.writeTextFile(savedfile, save_content);
        toast.success('Parameters saved successfully');
    };

    const load_parameters = async () => {
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
            console.log('parsed', parsed);
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
            console.log({ hyperparameters: $hyperparameters[$model], parameters: $parameters[$model] });
            // $hyperparameters[$model] = parsed.values.hyperparameters;
            // $parameters[$model] = parsed.values.parameters;

            Object.keys($hyperparameters[$model]).forEach(key => {
                if (!(key in parsed.values)) return;
                $hyperparameters[$model][key] = parsed.values[key];
                $all_params_lock_status[$model].hyperparameters[key] = false;
            });
            Object.keys($parameters[$model]).forEach(key => {
                if (!(key in parsed.values)) return;
                $parameters[$model][key] = parsed.values[key];
                $all_params_lock_status[$model].parameters[key] = false;
            });
            toast.success('Parameters uploaded successfully');
        } catch (e) {
            toast.error('Error: Invalid JSON file');
        }
    };

    const reset_parameters = () => {
        uploadedfile = null;
        $hyperparameters[$model] = structuredClone($default_param_values.hyperparameters);
        $parameters[$model] = structuredClone($default_param_values.parameters);

        typeSafeObjectKeys($all_params_lock_status[$model].hyperparameters).forEach(key => {
            $all_params_lock_status[$model].hyperparameters[key] = true;
        });
        typeSafeObjectKeys($all_params_lock_status[$model].parameters).forEach(key => {
            $all_params_lock_status[$model].parameters[key] = true;
        });
    };
</script>

<CustomPanel open={true}>
    <svelte:fragment slot="title" let:open>
        <div class="flex-center">
            <span>MODEL: {$current_model.name}</span>
            {#if !open}
                {#if $default_parameter_mode}
                    <span class="badge badge-sm">Default mode</span>
                {/if}
            {/if}
        </div>
    </svelte:fragment>
    <div class="grid gap-2">
        <ModelTab />
        <span class="text-sm">{$current_model.description}</span>
        {#if $current_model}
            <div class="flex justify-between">
                <h3>Hyperparameters</h3>
                <div class="flex gap-2">
                    <Checkbox bind:value={$default_parameter_mode} label="defaults" />
                    <button class="btn btn-sm btn-outline" on:click={reset_parameters}>
                        <RotateCcw />
                        <span>Reset</span>
                    </button>
                    <button class="btn btn-sm btn-outline" on:click={load_parameters}>
                        <Download />
                        <span>Load</span>
                    </button>
                    <button class="btn btn-sm btn-outline" on:click={save_parameters}>
                        <Save />
                        <span>Save</span>
                    </button>
                </div>
            </div>
            {#if uploadedfile && uploadedfile.model === $model}
                <div class="badge badge-sm badge-info">loaded: {uploadedfile.name}</div>
            {/if}
        {/if}
    </div>

    {#if $hyperparameters?.[$model]}
        <ModelParameters key="hyperparameters" bind:values={$hyperparameters[$model]} />
    {:else}
        <Notification message="No hyperparameters found" type="error" />
    {/if}
</CustomPanel>
