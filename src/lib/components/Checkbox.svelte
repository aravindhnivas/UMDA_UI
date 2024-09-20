<script lang="ts">
    export let value: boolean = false;
    export let label: string = '';
    export let bordered = true;
    export let check: 'toggle' | 'checkbox' = 'toggle';
    export let text_position: 'left' | 'right' = 'left';
    export let disabled = false;
    export let helper: string = '';
    export let helperHighlight: string = '';
    let className = '';
    export { className as class };
    if (check === 'checkbox') {
        text_position = 'right';
        bordered = false;
    }
</script>

<div class="grid gap-1">
    <div
        class="flex gap-2 items-center {bordered
            ? 'border-solid border-black border-1 rounded-md'
            : ''} p-1 {className}"
    >
        {#if text_position === 'left'}
            <span class="label-text">{label}</span>
        {/if}
        <input type="checkbox" class={check} bind:checked={value} {disabled} on:change />
        {#if text_position === 'right'}
            <span class="label-text">{label}</span>
        {/if}
    </div>
    {#if helper}
        <span class="text-xs text-wrap break-words max-w-sm">
            {helper}
            {#if helperHighlight}
                <br />
                <div class="badge badge-sm badge-neutral">
                    {helperHighlight}
                </div>
            {/if}
        </span>
    {/if}
</div>

<style>
    input.checkbox {
        border: solid 1px #000;
    }
</style>
