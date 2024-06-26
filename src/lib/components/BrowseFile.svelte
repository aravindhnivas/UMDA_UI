<script lang="ts">
    import { isError, tryF } from 'ts-try';
    import { HelpCircle } from 'lucide-svelte/icons';
    export let btn_name = 'Browse file';
    export let filename = '';
    export let helper = '';
    export let label = '';
    export let directory = false;
    export let load_callback: null | ((filename: string) => Promise<void>) = null;

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

    const callback = async () => {
        try {
            if (!load_callback) return toast.error('No load callback provided');
            if (!filename) return toast.error('No file selected');
            const result = await load_callback(filename);
            toast.success('File loaded successfully: ' + (await path.basename(filename)));
            return result;
        } catch (error) {
            if (typeof error === 'string') toast.error(error);
            else if (isError(error)) toast.error(error.message);
            else toast.error('An error occurred');
        }
    };
</script>

<div class="flex flex-col gap-1">
    {#if label}
        <span class="text-sm pl-1">{label} (<em>{filename.split('/').at(-1) || 'Choose a file'}</em>)</span>
    {:else if filename && !directory}
        <span class="text-sm pl-1">Filename: <em>{filename.split('/').at(-1)}</em></span>
    {/if}
    <div class="join">
        <button class="btn btn-sm join-item" on:click={browse_file}>{btn_name}</button>
        <input type="text" class="input input-sm join-item w-full" bind:value={filename} on:change={callback} />
        {#if load_callback}
            <button class="btn btn-sm join-item" on:click={callback}>load</button>
        {/if}
    </div>
    {#if helper}
        <span class="flex items-center gap-0.5 text-xs ml-auto">
            <HelpCircle size="20" />
            <span>{helper}</span>
        </span>
    {/if}
</div>
