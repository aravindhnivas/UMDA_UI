<script lang="ts">
    import { HelpCircle } from 'lucide-svelte/icons';
    export let btn_name = 'Browse file';
    export let filename = '';
    export let helper = '';
    export let label = '';
</script>

<div class="flex flex-col gap-1">
    {#if label}
        <span class="text-sm pl-1">{label}</span>
    {/if}
    <div class="join">
        <button
            class="btn btn-sm join-item rounded-0"
            on:click={async () => {
                const result = await dialog.open();
                if (!result) return;
                if (typeof result === 'string') {
                    filename = result;
                } else {
                    filename = result[0];
                }
            }}>{btn_name}</button
        >
        <input type="text" class="input input-sm join-item w-full" bind:value={filename} />
    </div>
    {#if helper}
        <span class="flex items-center gap-0.5 text-xs ml-auto">
            <HelpCircle size="20" />
            <span>filename</span>
        </span>
    {/if}
</div>
