<script lang="ts">
    export let label: string = '';
    export let value: string | number;
    export let helper: string = '';
    let className = '';
    export { className as class };
</script>

<div class="grid {className}">
    {#if label}
        <span class="text-xs pl-1">{label}</span>
    {/if}

    <input class="input input-sm" bind:value {...$$restProps} on:change />
    {#if helper}
        <span class="text-xs m-auto">{helper}</span>
    {/if}
</div>
