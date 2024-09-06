<script lang="ts">
    import { UnlockKeyhole, LockKeyhole } from 'lucide-svelte/icons';
    export let label: string = '';
    export let value: string | number;
    export let helper: string = '';
    export let enabled_lock_mode = false;
    export let lock: boolean = false;
    let className = '';
    export { className as class };
</script>

<div class="grid gap-1 {className}">
    <div class="flex gap-1 items-center">
        {#if label}
            <button on:click={() => (lock = !lock)}>
                {#if enabled_lock_mode}
                    {#if lock}
                        <LockKeyhole size="20" class="text-gray-500" />
                    {:else}
                        <UnlockKeyhole size="20" />
                    {/if}
                {/if}
            </button>
            <span class="text-xs pl-1">{label}</span>
        {/if}
    </div>
    <input
        class="input input-sm"
        bind:value
        {...$$restProps}
        on:change
        disabled={enabled_lock_mode && lock}
        autocomplete="on"
        autocapitalize="on"
    />
    {#if helper}
        <span class="text-xs m-auto">{helper}</span>
    {/if}
</div>
