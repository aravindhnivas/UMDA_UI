<script lang="ts">
    import Textfield from '@smui/textfield';
    export let value: string = '';
    export let lock: boolean = false;
    export let label: string = '';
    export let filetype: string = '';
    export let dir: boolean = true;

    const dispatch = createEventDispatcher();
    const browse_folder = async () => {
        let filter: { name: string; extensions: string[] }[] = [];
        if (filetype) {
            filter = [{ name: filetype, extensions: [filetype] }];
        }
        const result = await dialog.open({
            directory: dir,
            filters: [...filter, { name: 'All files', extensions: ['*.*', ''] }],
            multiple: false,
        });
        if (!result) return;
        if (typeof result === 'string') {
            value = result;
        } else {
            value = result[0];
        }

        dispatch('fileupdate', result);
    };
</script>

<div class="row">
    <button disabled={lock ?? false} class="btn btn-sm" on:click={browse_folder}>Browse</button>
    <Textfield bind:value disabled={lock ?? false} type="text" {label} />
    <!-- svelte-ignore missing-declaration -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <i
        on:click={async () => {
            if (typeof value !== 'string') return toast.error(`Invalid path`);
            if (!(await fs.exists(value))) return toast.error(`Directory does not exist`);
            await shell.open(value);
        }}
        class="i-material-symbols-folder-open-outline"
    ></i>

    {#if lock}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <i on:click={() => (lock = !lock)} class="i-material-symbols-lock-outline"></i>
    {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <i on:click={() => (lock = !lock)} class="i-material-symbols-lock-open-right-outline"></i>
    {/if}
</div>

<style>
    .row {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        gap: 0.5em;
        align-items: center;
    }
</style>
