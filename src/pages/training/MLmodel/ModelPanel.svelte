<script lang="ts">
    import { training_file } from './../training_file/stores';
    import {
        model,
        current_model,
        default_parameter_mode,
        all_params_lock_status,
        fine_tune_model,
        fine_tuned_values,
        grid_search_method,
        cv_fold,
        current_pretrained_dir,
        pre_trained_filename,
        tune_parameters,
        experiment_id,
        model_names,
        get_default_param_values,
        cleanlab,
    } from './stores';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import ModelParameters from './ModelParameters.svelte';
    import Notification from '$lib/components/Notification.svelte';
    import { Checkbox, CustomSelect } from '$lib/components';
    import { RotateCcw, Save, Download } from 'lucide-svelte/icons';
    import { parse_fine_tuned_values, set_default_fine_tuned_values } from './utils';
    import supervised_ml_models from '$lib/config/ml_model/ml_models_parameters';
    import CustomTabs from '$lib/components/CustomTabs.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { embedd_savefile, embedding, embeddings } from '../embedding/stores';
    import { current_training_processed_data_directory } from '../training_file/plot-analysis/stores';

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

    const reset_parameters = (model_name: MLModel) => {
        uploadedfile = null;
        $tune_parameters[model_name] = get_default_param_values(model_name);
        Object.keys($all_params_lock_status[model_name].hyperparameters).forEach(key => {
            $all_params_lock_status[model_name].hyperparameters[key] = true;
        });
        Object.keys($all_params_lock_status[model_name].parameters).forEach(key => {
            $all_params_lock_status[model_name].parameters[key] = true;
        });
        set_default_fine_tuned_values('all', model_name);
        $experiment_id[model_name] = 'normal';
    };

    $: if ($training_file.filename || $embedding) {
        model_names.forEach(model_name => {
            reset_parameters(model_name);
        });
    }
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
        <CustomTabs
            class="bordered"
            tabs={Object.keys(supervised_ml_models).map(f => ({ tab: f }))}
            bind:active={$model}
        />
        <span class="text-sm">{$current_model.description}</span>
        {#if $current_model}
            <div class="flex justify-between">
                <h3>Hyperparameters</h3>
                <div class="flex gap-2">
                    <CustomSelect bind:value={$embedding} items={embeddings} />
                    <Checkbox bind:value={$default_parameter_mode} label="defaults" />
                    <button class="btn btn-sm btn-outline" on:click={() => reset_parameters($model)}>
                        <RotateCcw />
                        <span>Reset</span>
                    </button>
                    <button
                        class="btn btn-sm btn-outline"
                        on:click={async () => {
                            const main_dir = await $current_training_processed_data_directory;
                            const loc = await path.join(
                                main_dir,
                                'pretrained_models',
                                $model,
                                $embedd_savefile,
                                $grid_search_method,
                            );
                            const name = $fine_tune_model ? 'fine_tuned_parameters' : 'best_params';
                            const files = await fs.readDir(loc);
                            const best_params_filename = files.filter(
                                f => f.isFile && f.name.endsWith(name + '.json'),
                            )[0];
                            console.warn(best_params_filename);
                            const best_params_file = await path.join(loc, best_params_filename.name);
                            console.warn(best_params_file);
                            if (!(await fs.exists(best_params_file))) {
                                console.warn(best_params_file);
                                toast.error('Best params file not found' + best_params_file);
                                return;
                            }
                            await load_parameters(best_params_file);
                            $experiment_id[$model] = 'best_model';
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

    <div class="flex">
        <CustomInput
            bind:value={$experiment_id[$model]}
            label="Experiment id"
            disabled={$default_parameter_mode || $fine_tune_model}
        />
    </div>

    {#if $tune_parameters[$model].hyperparameters}
        <ModelParameters key="hyperparameters" />
    {:else}
        <Notification message="No hyperparameters found" type="error" />
    {/if}
</CustomPanel>
