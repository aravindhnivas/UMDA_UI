<script lang="ts">
    export let label: string = '';
    export let value: string;
    export let items: string[] = [];
    export let helper: string = '';

    let className = '';
    export { className as class };
</script>

<div class="flex flex-col gap-1 min-w-[100px]">
    <span class="text-xs pl-1">{label}</span>

    <select class="select select-sm select-bordered {className}" bind:value>
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
