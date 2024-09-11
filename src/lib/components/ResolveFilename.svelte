<script lang="ts">
    export let filename: Promise<string> | string;
    export let basename: boolean = true;
    let className = '';
    export { className as class };
    export let absolute = false;
    const get_basename_or_dirname = async (filename: string) => {
        if (basename) return path.basename(await filename);
        return path.dirname(await filename);
    };
</script>

{#if filename}
    {#await filename then file_path}
        {#await fs.exists(file_path) then file_exists}
            {#if absolute}
                <div class={className} class:badge-error={!file_exists}>
                    {file_path || (basename ? 'file' : 'directory') + ' exists'}
                </div>
            {:else}
                {#await get_basename_or_dirname(file_path) then fname}
                    <div class={className} class:badge-error={!file_exists}>
                        {fname || (basename ? 'file' : 'directory') + ' exists'}
                    </div>
                {/await}
            {/if}
        {/await}
    {/await}
{:else}
    <div class="badge badge-error {className}">No {basename ? 'file' : 'directory'} selected</div>
{/if}
