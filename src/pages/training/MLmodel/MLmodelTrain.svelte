<script lang="ts">
    import { Checkbox, CustomSelect } from '$lib/components';
    import supervised_ml_models from '$lib/config/supervised_ml_models.yml';
    import Textfield from '@smui/textfield';

    export let id: string = 'ml_model-train-container';
    export let display: string = 'none';

    const model = localWritable('ml_model', '');
    let values = {} as Record<string, any>;
    let current_model = null as null | {
        description: string;
        hyperparameters: Record<string, any>;
    };

    const set_model = () => {
        if (!$model) return;
        current_model = supervised_ml_models[$model];
        if (!current_model) return;

        values = {};
        Object.keys(current_model['hyperparameters']).forEach(label => {
            if (!current_model) return;
            const value = current_model['hyperparameters'][label];
            // console.log(typeof value, value);
            if (typeof value === 'object' && value) {
                values[label] = value.default;
            } else {
                values[label] = value;
            }
        });
    };

    onMount(() => {
        set_model();
    });
</script>

<div {id} style:display class="grid content-start gap-2">
    <div class="flex">
        <CustomSelect
            label="Supervised Learning Algorithms"
            bind:value={$model}
            items={Object.keys(supervised_ml_models)}
            on:change={set_model}
        />
    </div>

    {#if current_model}
        <span class="text-sm">{current_model['description']}</span>
        <hr />

        <div class="flex flex-wrap gap-4">
            {#each Object.keys(current_model['hyperparameters']) as label (label)}
                {@const value = current_model['hyperparameters'][label]}
                {#if typeof value === 'boolean'}
                    <div class="flex gap-1">
                        <Checkbox class="p-2" bind:value={values[label]} {label} />
                        <span class="badge cursor-pointer text-xs p-1">?</span>
                    </div>
                {:else if typeof value === 'string' || typeof value === 'number'}
                    <Textfield bind:value={values[label]} {label} />
                {:else if typeof value === 'object' && value}
                    <CustomSelect {label} items={value.options} bind:value={values[label]} />
                {:else if value == null}
                    <Textfield bind:value={values[label]} {label} />
                {/if}
            {/each}
        </div>
    {/if}
</div>
