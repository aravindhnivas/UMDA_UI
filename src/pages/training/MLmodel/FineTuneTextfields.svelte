<script lang="ts">
    import Textfield from '@smui/textfield';

    const unique_id = getContext<string>('unique_id');

    export let value: string | number;
    export let label: string;

    let values = {
        min: 0,
        max: 1,
        step: 0.01,
    };

    onMount(() => {
        if (typeof value === 'string' && !isNaN(Number(value))) {
            value = parseFloat(value);
            console.log(value);
            values = {
                min: value - 10 * value,
                max: value + 10 * value,
                step: value / 100,
            };
        }
    });
</script>

<div class="flex gap-1" id="{unique_id}-{label}">
    <Textfield bind:value label="value" />
    {#each ['min', 'max', 'step'] as item}
        <Textfield value={values[item]} label={item} id="{unique_id}-{label}-{item}" />
    {/each}
</div>
