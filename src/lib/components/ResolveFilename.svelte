<script lang="ts">
    export let filename: Promise<string> | string;
    export let basename: boolean = true;

    let className = '';
    export { className as class };

    const get_basename_or_dirname = async (filename: string) => {
        if (basename) return path.basename(await filename);
        return path.dirname(await filename);
    };
</script>

{#if filename}
    {#await filename then file_path}
        {#await fs.exists(file_path) then file_exists}
            {#await get_basename_or_dirname(file_path) then fname}
                <div class="badge badge-success {className}" class:badge-error={!file_exists}>
                    {fname || (basename ? 'file' : 'directory')} exists
                </div>
            {/await}
        {/await}
    {/await}
{:else}
    <div class="badge badge-error {className}">No {basename ? 'file' : 'directory'} selected</div>
{/if}
