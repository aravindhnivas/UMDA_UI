<script lang="ts">
    import { isError } from 'ts-try';
    import { HelpCircle, ExternalLink, UnlockKeyhole, LockKeyhole } from 'lucide-svelte/icons';
    import type { DialogFilter } from '@tauri-apps/api/dialog';

    export let disabled = false;
    export let filename = '';
    export let helper = '';
    export let label = '';
    export let directory = false;
    export let filters: DialogFilter[] = [];
    export let btn_name = `Browse ${directory ? 'directory' : 'file'}`;
    export let callback: null | ((filename: string) => Promise<void>) = null;
    export let lock: boolean = false;
    export let show_lock_label = false;

    let className = '';
    export { className as class };

    const dispatch = createEventDispatcher();

    const browse_file = async () => {
        if (disabled) {
            toast.error('This field is disabled');
            return;
        }
        const result = await dialog.open({
            directory,
            filters,
        });
        if (!result) return;
        if (typeof result === 'string') {
            filename = result;
        } else {
            filename = result[0];
        }
        if (filename) dispatch('file_selected', filename);
    };

    const load_callback = async () => {
        if (disabled) {
            toast.error('This field is disabled');
            return;
        }
        try {
            if (!callback) return toast.error('No load callback provided');
            if (!filename) return toast.error('No file selected');
            const result = await callback(filename);
            toast.success('File loaded successfully: ' + (await path.basename(filename)));
            return result;
        } catch (error) {
            if (typeof error === 'string') toast.error(error);
            else if (isError(error)) toast.error(error.message);
            else toast.error('An error occurred');
        }
    };
</script>

<div class="flex flex-col gap-1 w-full {className}">
    <div class="flex">
        {#if show_lock_label}
            <button class="btn btn-xs" on:click={() => (lock = !lock)}>
                {#if lock}
                    <LockKeyhole size="20" class="text-gray-500" />
                {:else}
                    <UnlockKeyhole size="20" />
                {/if}
            </button>
        {/if}

        {#if label}
            <span class="text-sm pl-1"
                >{label} (<em>{filename.split('/').at(-1) || `Choose a ${directory ? 'directory' : 'file'}`}</em>)</span
            >
        {:else if filename && !directory}
            <span class="text-sm pl-1">Filename: <em>{filename.split('/').at(-1)}</em></span>
        {/if}
        {#if helper}
            <span class="flex items-center gap-0.5 text-xs ml-auto">
                <HelpCircle size="20" />
                <span>{helper}</span>
            </span>
        {/if}
    </div>
    <div class="join">
        <button class="btn btn-sm btn-neutral join-item" on:click={browse_file} disabled={lock}>
            {btn_name}
        </button>
        <input
            type="text"
            class="input input-sm join-item w-full"
            bind:value={filename}
            disabled={disabled || lock}
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
        />
        {#if callback}
            <button class="btn btn-sm join-item" on:click={load_callback}>load</button>
        {/if}
        <button
            class="btn btn-sm btn-outline join-item"
            on:click={async () => {
                if (!filename) return toast.error('No file selected');
                if (directory) await shell.open(filename);
                else await shell.open(await path.dirname(filename));
            }}><ExternalLink /></button
        >
    </div>
</div>
