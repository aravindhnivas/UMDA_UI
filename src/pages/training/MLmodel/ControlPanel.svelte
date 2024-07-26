<script lang="ts">
    import { fine_tune_model, kfold_nsamples, bootstrap_nsamples, noise_scale } from './stores';
    import { Checkbox } from '$lib/components';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import Textfield from '@smui/textfield';

    export let test_size = 20;
    export let bootstrap = true;
</script>

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
            <div class="grid justify-items-end">
                <Checkbox bind:value={$fine_tune_model} label="fine-tune hyperparameters" check="checkbox" />
                <Textfield bind:value={$kfold_nsamples} input$min="2" label="CV (N-fold)" type="number" />
            </div>

            <div class="grid justify-items-end">
                <Checkbox bind:value={bootstrap} label="bootstrap" check="checkbox" />
                {#if bootstrap}
                    <div class="flex gap-2">
                        <Textfield bind:value={$bootstrap_nsamples} label="Number of samples" type="number" />
                        <Textfield
                            bind:value={$noise_scale}
                            label="noise"
                            type="number"
                            input$step="0.1"
                            input$min="0"
                            input$max="1"
                        />
                    </div>
                {/if}
            </div>
        </div>
    </div>
</CustomPanel>
