<script lang="ts">
    import Chip, { Set, Text } from '@smui/chips';
    import {
        available_scalers,
        available_transformations,
        cleanlab,
        current_pretrained_file,
        default_parameter_mode,
        enable_y_transformation_and_scaling,
        model,
        model_names,
        yscaling,
        ytransformation,
    } from './stores';
    import { embedding, embeddings } from '../embedding/stores';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    export let compute_btn: HTMLButtonElement;

    let models: Partial<MLModel>[] = ['lgbm', 'catboost', 'xgboost', 'gbr'];
    let embedders: Partial<Embedding>[] = ['mol2vec', 'VICGAE'];
    let clean = ['true', 'false'];
    let modes = ['default', 'best_params'];

    let available_ytys: string[] = [];

    const combine_all_y_transformations_and_scaling = async () => {
        for (const yt of available_transformations) {
            for (const ys of available_scalers) {
                available_ytys = [...available_ytys, `${yt}-${ys}`];
            }
        }
    };
    combine_all_y_transformations_and_scaling();

    let ytys: string[] = ['None-None'];
    let scheduler_running = false;
    let cancelScheduler = false;
    let progress_percent = 0;
    const variable_update_time = localWritable('variable_update_time', 500);
    const next_cycle_time = localWritable('next_cycle_time', 1000);
    $: total_iterations = models.length * embedders.length * clean.length * modes.length * ytys.length;
    $: total_sleep_time = (7 * $variable_update_time + $next_cycle_time) * total_iterations;
    $: total_sleep_time_in_seconds = total_sleep_time / 1000;

    const scheduler = async () => {
        if (!compute_btn) {
            toast.error('Error: Compute button not found');
            return;
        }
        console.warn('Scheduler running');
        console.time('scheduler finished');
        const load_best_params_button = document.getElementById('load_best_params_button') as HTMLButtonElement;

        // raise error if none of the arrays are of length 2
        if (models.length !== 2 && embedders.length !== 2 && clean.length !== 2 && modes.length !== 2) {
            toast.error('Error: At least one of the arrays must have a length of 2');
            return;
        }

        scheduler_dialog.close();
        if (ytys.length === 0) {
            ytys = ['None-None'];
        }

        scheduler_running = true;
        cancelScheduler = false;
        const total_length = models.length * embedders.length * clean.length * modes.length * ytys.length;
        progress_percent = 0;

        try {
            for (const model of models) {
                if (cancelScheduler) break;
                for (const embedder of embedders) {
                    if (cancelScheduler) break;
                    for (const cl of clean) {
                        if (cancelScheduler) break;
                        for (const mode of modes) {
                            if (cancelScheduler) break;
                            for (const available_ytys of ytys) {
                                if (cancelScheduler) break;
                                const [yt, ys] = available_ytys.split('-');

                                $ytransformation = yt;
                                await sleep($variable_update_time);

                                $yscaling = ys;
                                await sleep($variable_update_time);

                                if (yt === 'None' && ys === 'None') {
                                    $enable_y_transformation_and_scaling = false;
                                } else {
                                    $enable_y_transformation_and_scaling = true;
                                }
                                await sleep($variable_update_time);

                                $model = model;
                                await sleep($variable_update_time);

                                $embedding = embedder;
                                await sleep($variable_update_time);

                                $cleanlab.active = JSON.parse(cl);
                                await sleep($variable_update_time);

                                if (mode === 'best_params') {
                                    if (!load_best_params_button) {
                                        toast.error('Error: Load best params button not found');
                                        return;
                                    }
                                    console.warn('loading best params');
                                    load_best_params_button.click();
                                } else if (mode === 'default') {
                                    console.warn('setting default params');
                                    $default_parameter_mode = true;
                                }
                                await sleep($variable_update_time);

                                const pkl_file = (await $current_pretrained_file) + '.pkl';
                                const pkl_file_exists = await fs.exists(pkl_file);
                                const pkl_filename = await path.basename(pkl_file);
                                console.log(`file exists: ${pkl_filename}: ${pkl_file_exists}`);
                                if (skip_file_if_exists && pkl_file_exists) {
                                    console.warn('file exists. skipping...', pkl_filename);
                                    await sleep($next_cycle_time);
                                    progress_percent += 100 / total_length;
                                    continue;
                                }
                                console.log({
                                    $model,
                                    $embedding,
                                    cl: $cleanlab.active,
                                    mode,
                                    yt,
                                    ys,
                                });
                                compute_btn.click();
                                await sleep($next_cycle_time);
                                progress_percent += 100 / total_length;
                            }
                        }
                    }
                }
            }
        } finally {
            scheduler_running = false;
            cancelScheduler = false;
            console.timeEnd('scheduler finished');
        }
    };

    let scheduler_dialog: HTMLDialogElement;
    const stopScheduler = () => {
        cancelScheduler = true;
        console.warn('Cancelling scheduler...');
    };

    let skip_file_if_exists = true;
    // $: scheduler_dialog?.showModal();
</script>

<button
    class="btn btn-sm {scheduler_running ? 'btn-error' : 'btn-warning'}"
    on:click={async () => {
        if (scheduler_running) {
            stopScheduler();
        } else {
            scheduler_dialog?.showModal();
        }
    }}
>
    {#if scheduler_running}
        <span class="loading loading-dots loading-sm"></span>
        <span>Cancel Scheduler ({Number(progress_percent.toFixed(2))} %)</span>
    {:else}
        <span>Scheduler</span>
    {/if}
</button>

<dialog bind:this={scheduler_dialog} class="modal">
    <div class="modal-box bg-orange-400 w-11/12 max-w-5xl">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="text-lg font-bold">
            <span>Scheduler</span>
            <span class="badge badge-xs badge-info"
                >{models.length * embedders.length * clean.length * modes.length * ytys.length}</span
            >
        </h3>

        <div class="grid content-baseline gap-2 overflow-auto h-[500px]">
            <div class="flex-gap items-end">
                <Checkbox bind:value={skip_file_if_exists} label="Skip if file exists" />
                <CustomInput
                    label="Variable update time (ms)"
                    bind:value={$variable_update_time}
                    type="number"
                    min="100"
                />
                <CustomInput label="Next cycle time (ms)" bind:value={$next_cycle_time} type="number" min="100" />
                <!-- Total computation time -->
                <div>
                    <span>Scheduling time:</span>
                    <span class="badge badge-xs badge-info">{total_sleep_time_in_seconds} s</span>
                </div>
            </div>
            <div class="grid border border-solid border-black rounded px-1 mr-2">
                <div class="flex justify-between pt-2">
                    <span class="text-md">Models</span>
                    <span class="badge badge-sm">{models.length}</span>
                </div>
                <Set chips={model_names} let:chip filter bind:selected={models}>
                    <Chip {chip} touch>
                        <Text>{chip}</Text>
                    </Chip>
                </Set>
            </div>
            <div class="grid border border-solid border-black rounded px-1 mr-2">
                <div class="flex justify-between pt-2">
                    <span>Embedders</span>
                    <span class="badge badge-sm">{embedders.length}</span>
                </div>
                <Set chips={embeddings} let:chip filter bind:selected={embedders}>
                    <Chip {chip} touch>
                        <Text>{chip}</Text>
                    </Chip>
                </Set>
            </div>
            <div class="grid border border-solid border-black rounded px-1 mr-2">
                <div class="flex justify-between pt-2">
                    <span>Data clean</span>
                    <span class="badge badge-sm">{clean.length}</span>
                </div>
                <Set chips={['true', 'false']} let:chip filter bind:selected={clean}>
                    <Chip {chip} touch>
                        <Text>{chip}</Text>
                    </Chip>
                </Set>
            </div>
            <div class="grid border border-solid border-black rounded px-1 mr-2">
                <div class="flex justify-between pt-2">
                    <span>Modes</span>
                    <span class="badge badge-sm">{modes.length}</span>
                </div>
                <Set chips={['default', 'best_params']} let:chip filter bind:selected={modes}>
                    <Chip {chip} touch>
                        <Text>{chip}</Text>
                    </Chip>
                </Set>
            </div>
            <div class="grid border border-solid border-black rounded px-1 mr-2">
                <div class="flex justify-between pt-2">
                    <span>ytransformation-yscaling</span>
                    <span class="badge badge-sm">{ytys.length}</span>
                </div>
                <Set chips={available_ytys} let:chip filter bind:selected={ytys}>
                    <Chip {chip} touch>
                        <Text>{chip}</Text>
                    </Chip>
                </Set>
            </div>
        </div>

        <div class="modal-action">
            <button
                class="btn btn-sm btn-warning"
                on:click={async () => {
                    await scheduler();
                }}
            >
                Submit
            </button>
        </div>
    </div>
</dialog>
