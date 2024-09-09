<script lang="ts">
    export let value: boolean = false;
    export let label: string = '';
    export let bordered = true;
    export let check: 'toggle' | 'checkbox' = 'toggle';
    export let text_position: 'left' | 'right' = 'left';
    export let disabled = false;

    let className = '';
    export { className as class };
    if (check === 'checkbox') {
        text_position = 'right';
        bordered = false;
    }
</script>

<div class="flex gap-2 items-center {bordered ? 'border-solid border-black border-1 rounded-md' : ''} p-1 {className}">
    {#if text_position === 'left'}
        <span class="label-text">{label}</span>
    {/if}
    <input type="checkbox" class={check} bind:checked={value} {disabled} on:change />
    {#if text_position === 'right'}
        <span class="label-text">{label}</span>
    {/if}
</div>

<style>
    input.checkbox {
        border: solid 1px #000;
    }
</style>
