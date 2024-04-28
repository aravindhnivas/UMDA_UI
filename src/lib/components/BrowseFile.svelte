<script lang="ts">
    import { HelpCircle } from 'lucide-svelte/icons';
    export let btn_name = 'Browse file';
    export let filename = '';
    export let helper = '';
    export let label = '';
    export let directory = false;

    const dispatch = createEventDispatcher();

    const browse_file = async () => {
        const result = await dialog.open({ directory });
        if (!result) return;
        if (typeof result === 'string') {
            filename = result;
        } else {
            filename = result[0];
        }
        if (filename) dispatch('file_selected', filename);
    };
</script>

<div class="flex flex-col gap-1">
    {#if label}
        <span class="text-sm pl-1">{label}</span>
    {:else if filename && !directory}
        <span class="text-sm pl-1">Filename: <em>{filename.split('/').at(-1)}</em></span>
    {/if}
    <div class="join">
        <button class="btn btn-sm join-item" on:click={browse_file}>{btn_name}</button>
        <input type="text" class="input input-sm join-item w-full" bind:value={filename} />
    </div>
    {#if helper}
        <span class="flex items-center gap-0.5 text-xs ml-auto">
            <HelpCircle size="20" />
            <span>filename</span>
        </span>
    {/if}
</div>
