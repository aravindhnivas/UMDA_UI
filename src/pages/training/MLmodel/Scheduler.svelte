<script lang="ts">
    import Chip, { Set, Text } from '@smui/chips';
    import {
        available_scalers,
        available_transformations,
        cleanlab,
        default_parameter_mode,
        model,
        model_names,
    } from './stores';
    import { embedding, embeddings } from '../embedding/stores';
    export let compute_btn: HTMLButtonElement;

    let models: Partial<MLModel>[] = ['lgbm', 'catboost', 'xgboost', 'gbr'];
    let embedders: Partial<Embedding>[] = ['mol2vec', 'VICGAE'];
    let clean = ['true', 'false'];
    let modes = ['default', 'best_params'];
    let ytransformations_selected: string[] = ['None'];
    let yscaling_selected: string[] = ['None'];

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
        for (const model of models) {
            for (const embedder of embedders) {
                for (const cl of clean) {
                    for (const mode of modes) {
                        $model = model;
                        await sleep(500);
                        $embedding = embedder;
                        await sleep(500);
                        $cleanlab.active = JSON.parse(cl);
                        await sleep(500);

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
                        await sleep(500);
                        console.log({
                            $model,
                            $embedding,
                            cl: $cleanlab.active,
                            mode,
                        });
                        // compute_btn.click();
                        await sleep(1000);
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
    <div class="modal-box bg-orange-400">
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
            <!-- <span class="text-md">ytransformation</span>
            <Set chips={available_transformations} let:chip filter bind:selected={ytransformations_selected}>
                <Chip {chip} touch>
                    <Text>{chip}</Text>
                </Chip>
            </Set>
            <span class="text-md">yscaling</span>
            <Set chips={available_scalers} let:chip filter bind:selected={yscaling_selected}>
                <Chip {chip} touch>
                    <Text>{chip}</Text>
                </Chip>
            </Set> -->
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
