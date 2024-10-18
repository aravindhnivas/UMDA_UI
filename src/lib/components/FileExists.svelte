<script lang="ts">
    export let name: string | Promise<string>;

    const get_dir_and_basename = async (name: string | Promise<string>) => {
        const resolved = await name;
        const file_exists = await fs.exists(resolved);
        const dirname = await path.dirname(resolved);
        const basename = await path.basename(resolved);
        return { resolved, file_exists, dirname, basename };
    };
</script>

<!-- {#await name then resolved} -->
{#await get_dir_and_basename(name) then { resolved, file_exists, dirname, basename }}
    {#if file_exists}
        <slot {resolved} {dirname} {basename} />
    {:else}
        <slot name="else" {resolved} {dirname} {basename} />
    {/if}
{/await}
<!-- {/await} -->
