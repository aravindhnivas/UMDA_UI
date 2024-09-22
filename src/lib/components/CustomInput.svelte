<script lang="ts">
    import { UnlockKeyhole, LockKeyhole } from 'lucide-svelte/icons';
    export let label: string = '';
    export let value: string | number;
    export let helper: string = '';
    export let helperHighlight: string = '';
    export let enabled_lock_mode = false;
    export let lock: boolean = false;
    export let disabled = false;
    export let id: string = getID(5);

    let className = '';
    export { className as class };
    // export let helper_class = '';

    $: element_disabled = disabled || (enabled_lock_mode && lock);
</script>

<div class="grid gap-1 {className}">
    <div class="flex gap-1 items-center">
        {#if label}
            {#if enabled_lock_mode}
                <button on:click={() => (lock = !lock)}>
                    {#if lock}
                        <LockKeyhole size="20" class="text-gray-700" />
                    {:else}
                        <UnlockKeyhole size="20" />
                    {/if}
                </button>
            {/if}
            <span class="text-xs pl-1 {element_disabled ? 'text-gray-600/75' : ''}">{label}</span>
        {/if}
    </div>
    <input
        {id}
        class=" input input-sm {element_disabled ? 'bg-gray-600/25' : ''}"
        bind:value
        {...$$restProps}
        on:change
        on:keydown
        disabled={element_disabled}
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
    />
    {#if helper}
        <span class="text-xs text-wrap break-words {element_disabled ? 'text-gray-600/75' : ''}">
            {helper}
            {#if helperHighlight}
                <br />
                <div class="badge badge-sm badge-neutral {element_disabled ? 'text-gray' : ''}">
                    {helperHighlight}
                </div>
            {/if}
        </span>
    {/if}
</div>
