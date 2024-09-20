<script lang="ts">
    import { UnlockKeyhole, LockKeyhole } from 'lucide-svelte/icons';

    export let value: boolean = false;
    export let label: string = '';
    export let bordered = true;
    export let check: 'toggle' | 'checkbox' = 'toggle';
    export let text_position: 'left' | 'right' = 'left';
    export let disabled = false;
    export let helper: string = '';
    export let helperHighlight: string = '';
    export let enabled_lock_mode = false;
    export let lock: boolean = false;

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
            ? 'border-solid border-rounded border-1' + (disabled ? ' border-gray-600/75' : '')
            : ''} p-1 {className} w-max"
    >
        <button on:click={() => (lock = !lock)}>
            {#if enabled_lock_mode}
                {#if lock}
                    <LockKeyhole size="20" class="text-gray-700" />
                {:else}
                    <UnlockKeyhole size="20" />
                {/if}
            {/if}
        </button>
        {#if text_position === 'left'}
            <span class="label-text {disabled ? 'text-gray-600/75' : ''}">{label}</span>
        {/if}
        <input type="checkbox" class={check} bind:checked={value} {disabled} on:change />
        {#if text_position === 'right'}
            <span class="label-text {disabled ? 'text-gray-600/75' : ''}">{label}</span>
        {/if}
    </div>
    {#if helper}
        <span class="text-xs text-wrap break-words {disabled ? 'text-gray-600/75' : ''}">
            {helper}
            {#if helperHighlight}
                <br />
                <div class="badge badge-sm badge-neutral {disabled ? 'text-gray' : ''}">
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
