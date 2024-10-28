<script lang="ts">
    import Lockbutton from './Lockbutton.svelte';

    export let id: string = getID(5);
    export let value: string | number;
    export let label: string = '';
    export let helper: string = '';
    export let helperHighlight: string = '';
    export let lock: boolean | null = null;
    export let disabled = false;

    let className = '';
    export { className as class };

    $: element_disabled = disabled || lock;
</script>

<div class="grid gap-1 {className}">
    {#if label}
        <span class="text-xs {element_disabled ? 'text-gray-600/75' : ''}">
            {label}
        </span>
    {/if}

    <div class="flex items-center gap-2">
        <slot name="pre-input" />

        <label class="input input-sm flex items-center gap-2 w-full">
            <slot name="pre-input-within" />

            <input
                class="{element_disabled ? 'bg-gray-600/25' : ''} w-full"
                {id}
                bind:value
                {...$$restProps}
                on:change
                on:keydown
                disabled={element_disabled}
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
            />
            <slot name="post-input-within" />
            {#if lock !== null}
                <Lockbutton bind:lock on:lockchange />
            {/if}
        </label>
        <slot />
    </div>

    {#if helper || helperHighlight}
        <div class="grid grid-cols-[1fr_auto] gap-1 text-xs text-wrap break-words">
            {#if helper}
                <span class={element_disabled ? 'text-gray-600/75' : ''}>{helper}</span>
            {/if}
            {#if helperHighlight}
                <div class="badge badge-sm badge-neutral {element_disabled ? 'text-gray' : ''}">
                    {helperHighlight}
                </div>
            {/if}
        </div>
    {/if}
</div>
