<script lang="ts">
    export let label: string = '';
    export let value: string | number;
    export let helper: string = '';
    let className = '';
    export { className as class };
</script>

<div class="flex flex-col gap-1">
    {#if label}
        <span class="text-xs pl-1">{label}</span>
    {/if}

    <input class="input input-sm {className}" bind:value {...$$restProps} on:change />
    {#if helper}
        <span class="text-xs m-auto">{label}</span>
    {/if}
</div>
