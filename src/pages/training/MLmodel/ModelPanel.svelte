<script lang="ts">
    import {
        model,
        default_param_values,
        current_model,
        default_parameter_mode,
        all_params_lock_status,
        fine_tune_model,
        fine_tuned_values,
        grid_search_method,
        cv_fold,
        current_pretrained_file,
        tune_parameters,
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
                    values[label] = structuredClone($tune_parameters[$model][key][label]);
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

    const load_parameters = async (filename: string | null = null) => {
        if (!filename) {
            const selected = await dialog.open({
                title: 'Upload parameters',
                filters: [{ name: 'JSON', extensions: ['json'] }],
                defaultPath: `./${$model}.json`,
            });
            // filename = selected;
            if (Array.isArray(selected)) {
                filename = selected[0];
            } else if (selected === null) {
                return;
            } else {
                filename = selected;
            }
        }
        uploadedfile = null;

        try {
            const parsed = await readJSON<SavedParams>(filename);
            if (!parsed) return;

            console.log('parsed', parsed);
            if ($model !== parsed.model) {
                toast.error('Error: Model mismatch');
                return;
            }

            $default_parameter_mode = false;
            const basefilename = await path.basename(filename);
            uploadedfile = {
                fullname: filename,
                name: basefilename,
                model: parsed.model,
            };

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
                v.forEach(key => {
                    Object.keys($tune_parameters[$model][key]).forEach(label => {
                        if (!(label in parsed.values)) {
                            if (!(label in $all_params_lock_status[$model][key])) return;
                            $all_params_lock_status[$model][key][label] = true;
                            return;
                        }
                        if (isObject(parsed.values[label])) return;
                        $tune_parameters[$model][key][label] = parsed.values[label];
                        $all_params_lock_status[$model][key][label] = false;
                        $fine_tuned_values[$model][key][label].active = false;
                    });
                });
            }

            toast.success('Parameters uploaded successfully');
        } catch (e) {
            toast.error('Error: Invalid JSON file');
        }
    };

    const reset_parameters = () => {
        uploadedfile = null;
        $tune_parameters[$model] = structuredClone($default_param_values);
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
                    <button
                        class="btn btn-sm btn-outline"
                        on:click={async () => {
                            const pre_trained_file = await $current_pretrained_file;
                            let loc = await path.dirname(pre_trained_file);
                            if (!$fine_tune_model) {
                                loc = await path.join(loc, $grid_search_method);
                            }

                            const filename = await path.basename(pre_trained_file);
                            // const extname = filename.split('.').at(-1);
                            const name = $fine_tune_model ? 'fine_tuned_parameters' : 'best_params';
                            const best_params_filename = await path.join(
                                loc,
                                `${filename}.${$grid_search_method}.${name}.json`,
                            );
                            if (!(await fs.exists(best_params_filename))) {
                                toast.error('Best params file not found');
                                return;
                            }
                            // console.log({ pre_trained_file, loc, best_params_filename });
                            // console.log(best_params_filename);
                            await load_parameters(best_params_filename);
                        }}
                    >
                        <Download />
                        <span>Load Best params</span>
                    </button>
                    <button class="btn btn-sm btn-outline" on:click={async () => await load_parameters()}>
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

    {#if $tune_parameters[$model].hyperparameters}
        <ModelParameters key="hyperparameters" />
    {:else}
        <Notification message="No hyperparameters found" type="error" />
    {/if}
</CustomPanel>
