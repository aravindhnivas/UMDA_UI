<script lang="ts">
    import Textfield from '@smui/textfield';

    export let value: string | number;
    export let label: string;

    const unique_id = getContext<string>('unique_id');

    let values: Record<string, string> = {
        min: '0',
        max: '0',
        step: '0',
    };

    let Ndata = 10;

    onMount(() => {
        value = Number(value);
        if (isNaN(value)) {
            return;
        }
        const min = Number(value - 10 * value).toExponential(2);
        const max = Number(value + 10 * value).toExponential(2);
        const step = Number((Number(max) - Number(min)) / Ndata).toExponential(0);
        values = { min, max, step };
    });
</script>

<div class="flex gap-1">
    <Textfield
        bind:value={Ndata}
        label="# data"
        on:change={() => {
            values.step = Number((Number(values.max) - Number(values.min)) / Ndata).toExponential(0);
        }}
    />
    {#each ['min', 'max', 'step'] as item}
        <Textfield bind:value={values[item]} label={item} id="{unique_id}-{label}-{item}" type="text" />
    {/each}
    <input type="text" hidden value={`${values.min}, ${values.max}, ${values.step}`} id="{unique_id}-{label}" />
</div>
