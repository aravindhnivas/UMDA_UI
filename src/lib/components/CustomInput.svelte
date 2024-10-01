<script lang="ts">
    import { UnlockKeyhole, LockKeyhole } from 'lucide-svelte/icons';

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
        <div class="flex items-center gap-1">
            {#if lock !== null}
                <button on:click={() => (lock = !lock)}>
                    {#if lock}
                        <LockKeyhole size="20" class="text-gray-700" />
                    {:else}
                        <UnlockKeyhole size="20" />
                    {/if}
                </button>
            {/if}
            <span class="text-xs {element_disabled ? 'text-gray-600/75' : ''}">
                {label}
            </span>
        </div>
    {/if}

    <div class="flex items-center gap-2">
        <slot name="pre-input" />
        <label class="input input-sm {element_disabled ? 'bg-gray-600/25' : ''} flex items-center gap-2">
            <slot name="pre-input-within" />
            <input
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
        </label>
        <slot />
    </div>

    {#if helper}
        <div class="grid grid-cols-[1fr_auto] gap-1 text-xs text-wrap break-words">
            <span class={element_disabled ? 'text-gray-600/75' : ''}>{helper}</span>
            {#if helperHighlight}
                <div class="badge badge-sm badge-neutral {element_disabled ? 'text-gray' : ''}">
                    {helperHighlight}
                </div>
            {/if}
        </div>
    {/if}
</div>
