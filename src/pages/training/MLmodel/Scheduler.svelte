<script lang="ts">
    import Chip, { Set, Text } from '@smui/chips';
    import {
        available_scalers,
        available_transformations,
        cleanlab,
        default_parameter_mode,
        enable_y_transformation_and_scaling,
        model,
        model_names,
        yscaling,
        ytransformation,
    } from './stores';
    import { embedding, embeddings } from '../embedding/stores';
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
        let update_time = 500;
        let recycle_time = 1000;
        for (const model of models) {
            for (const embedder of embedders) {
                for (const cl of clean) {
                    for (const mode of modes) {
                        for (const available_ytys of ytys) {
                            const [yt, ys] = available_ytys.split('-');

                            $ytransformation = yt;
                            await sleep(update_time);

                            $yscaling = ys;
                            await sleep(update_time);

                            if (yt === 'None' && ys === 'None') {
                                $enable_y_transformation_and_scaling = false;
                            } else {
                                $enable_y_transformation_and_scaling = true;
                            }
                            await sleep(update_time);

                            $model = model;
                            await sleep(update_time);

                            $embedding = embedder;
                            await sleep(update_time);

                            $cleanlab.active = JSON.parse(cl);
                            await sleep(update_time);

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
                            await sleep(update_time);
                            console.log({
                                $model,
                                $embedding,
                                cl: $cleanlab.active,
                                mode,
                                yt,
                                ys,
                            });
                            compute_btn.click();
                            await sleep(recycle_time);
                        }
                    }
                }
            }
        }
        console.timeEnd('scheduler finished');
    };

    let scheduler_dialog: HTMLDialogElement;
    // $: scheduler_dialog?.showModal();
</script>

<button
    class="btn btn-sm btn-warning"
    on:click={async () => {
        scheduler_dialog?.showModal();
    }}>Scheduler</button
>
<dialog bind:this={scheduler_dialog} class="modal">
    <div class="modal-box bg-orange-400 w-11/12 max-w-5xl">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="text-lg font-bold">Scheduler</h3>
        <div class="grid content-baseline overflow-auto h-[500px]">
            <span class="text-md">Models</span>
            <Set chips={model_names} let:chip filter bind:selected={models}>
                <Chip {chip} touch>
                    <Text>{chip}</Text>
                </Chip>
            </Set>
            <span class="text-md">Embedders</span>
            <Set chips={embeddings} let:chip filter bind:selected={embedders}>
                <Chip {chip} touch>
                    <Text>{chip}</Text>
                </Chip>
            </Set>
            <span class="text-md">Data clean</span>
            <Set chips={['true', 'false']} let:chip filter bind:selected={clean}>
                <Chip {chip} touch>
                    <Text>{chip}</Text>
                </Chip>
            </Set>
            <span class="text-md">Modes</span>
            <Set chips={['default', 'best_params']} let:chip filter bind:selected={modes}>
                <Chip {chip} touch>
                    <Text>{chip}</Text>
                </Chip>
            </Set>
            <span class="text-md">ytransformation-yscaling</span>
            <Set chips={available_ytys} let:chip filter bind:selected={ytys}>
                <Chip {chip} touch>
                    <Text>{chip}</Text>
                </Chip>
            </Set>
        </div>

        <div class="modal-action">
            <button
                class="btn btn-sm btn-warning"
                on:click={async () => {
                    await scheduler();
                }}>Submit</button
            >
        </div>
    </div>
</dialog>
