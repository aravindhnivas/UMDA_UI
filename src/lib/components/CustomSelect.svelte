<script lang="ts">
    export let label: string = '';
    export let value: string;
    export let items: string[] = [];
    export let helper: string = '';
    export let disabled = false;
    let className = '';
    export { className as class };
</script>

<div class="flex flex-col gap-1 {className}">
    <span class="text-xs pl-1">{label}</span>

    <select class="select select-sm select-bordered" bind:value on:change {disabled}>
        {#if !label}
            <option disabled selected>embedding</option>
        {/if}
        {#each items as item}
            <option>{item}</option>
        {/each}
    </select>
    {#if helper}
        <span class="text-xs pl-1 m-auto">{helper}</span>
    {/if}
</div>
