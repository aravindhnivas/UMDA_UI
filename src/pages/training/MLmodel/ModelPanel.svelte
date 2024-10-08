<script lang="ts">
    import {
        hyperparameters,
        parameters,
        model,
        default_param_values,
        current_model,
        default_parameter_mode,
        all_params_lock_status,
        fine_tune_model,
        fine_tuned_values,
        grid_search_method,
        cv_fold,
    } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import ModelParameters from './ModelParameters.svelte';
    import Notification from '$lib/components/Notification.svelte';
    import { Checkbox } from '$lib/components';
    import ModelTab from './ModelTab.svelte';
    import { RotateCcw, Save, Download } from 'lucide-svelte/icons';
    import { parse_fine_tuned_values, set_default_fine_tuned_values } from './utils';

    let savedfile: string;
    let uploadedfile: { fullname: string; name: string; model: string } | null = null;

    const v = ['hyperparameters', 'parameters'] as const;

    const save_parameters = async () => {
        const saveloc = await dialog.save({
            title: 'Save parameters',
            filters: [{ name: 'JSON', extensions: ['json'] }],
        });

        if (!saveloc) return;
        savedfile = saveloc;

        let values: Record<string, any> = {};
        if ($fine_tune_model) {
            values = parse_fine_tuned_values();
        } else {
            v.forEach(key => {
                Object.keys($all_params_lock_status[$model][key]).forEach(label => {
                    const locked = $all_params_lock_status[$model][key][label];
                    if (locked) return;
                    if (key === 'hyperparameters') {
                        values[label] = structuredClone($hyperparameters[$model][label]);
                    } else {
                        values[label] = structuredClone($parameters[$model][label]);
                    }
                });
            });
        }

        if (isEmpty(values)) {
            toast.error('No parameters to save');
            return;
        }

        let save_json: SavedParams = {
            values,
            model: $model,
            timestamp: new Date().toLocaleString(),
            mode: $fine_tune_model ? 'fine_tuned' : 'normal',
        };

        if ($fine_tune_model) {
            save_json.grid_search_method = $grid_search_method;
            save_json.cv_fold = $cv_fold;
        }

        const save_content = JSON.stringify(save_json, null, 2);
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

        try {
            const parsed = await readJSON<SavedParams>(uploadloc);
            if (!parsed) return;

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
            $fine_tune_model = parsed.mode === 'fine_tuned';
            if ($fine_tune_model) {
                v.forEach(key => {
                    Object.keys($fine_tuned_values[$model][key]).forEach(label => {
                        if (!(label in parsed.values)) return;
                        if (!isObject(parsed.values[label])) return;

                        const { value, type, scale } = parsed.values[label];
                        $fine_tuned_values[$model][key][label] = {
                            value: isArray(value) ? value.join(', ') : value,
                            type,
                            scale,
                            active: true,
                        };
                        $all_params_lock_status[$model][key][label] = false;
                    });
                });
            } else {
                if (!parsed.values) return;
                if (parsed.mode !== 'normal') return toast.error('Error: Invalid mode');
                Object.keys($hyperparameters[$model]).forEach(label => {
                    if (!(label in parsed.values)) return;
                    if (isObject(parsed.values[label])) return;
                    $hyperparameters[$model][label] = parsed.values[label];
                    $all_params_lock_status[$model].hyperparameters[label] = false;
                });
                Object.keys($parameters[$model]).forEach(label => {
                    if (!(label in parsed.values)) return;
                    if (isObject(parsed.values[label])) return;
                    $parameters[$model][label] = parsed.values[label];
                    $all_params_lock_status[$model].parameters[label] = false;
                });
            }

            toast.success('Parameters uploaded successfully');
        } catch (e) {
            toast.error('Error: Invalid JSON file');
        }
    };

    const reset_parameters = () => {
        uploadedfile = null;
        $hyperparameters[$model] = structuredClone($default_param_values.hyperparameters);
        $parameters[$model] = structuredClone($default_param_values.parameters);
        Object.keys($all_params_lock_status[$model].hyperparameters).forEach(key => {
            $all_params_lock_status[$model].hyperparameters[key] = true;
        });

        Object.keys($all_params_lock_status[$model].parameters).forEach(key => {
            $all_params_lock_status[$model].parameters[key] = true;
        });

        set_default_fine_tuned_values('all');
    };
</script>

<CustomPanel open={true}>
    <svelte:fragment slot="title" let:open>
        <div class="flex-center">
            <span>MODEL: {$current_model.name}</span>
            {#if !open}
                {#if $default_parameter_mode}
                    <span class="badge">Default mode</span>
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
