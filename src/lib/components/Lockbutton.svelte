<script lang="ts">
    import { UnlockKeyhole, LockKeyhole } from 'lucide-svelte/icons';
    export let lock: boolean = false;

    let className = '';
    export { className as class };
    const dispatch = createEventDispatcher();
</script>

<button
    class={className}
    on:click={() => {
        lock = !lock;
        dispatch('lockchange', lock);
    }}
>
    {#if lock}
        <LockKeyhole size="20" class="text-gray-700" />
    {:else}
        <UnlockKeyhole size="20" />
    {/if}
</button>
