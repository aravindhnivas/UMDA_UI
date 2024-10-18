<script lang="ts">
    export let name: string | Promise<string>;
</script>

{#await name then resolved}
    {#await fs.exists(resolved) then name_exists}
        {#if name_exists}
            <slot {resolved} />
        {/if}
    {/await}
{/await}
