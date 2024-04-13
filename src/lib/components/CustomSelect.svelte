<script lang="ts">
    export let label: string = '';
    export let value: string;
    export let items: string[] = [];
</script>

<div class="flex flex-col min-w-[100px]">
    <span class="text-xs pl-1">{label}</span>
    <select class="select select-sm select-bordered" bind:value>
        {#if !label}
            <option disabled selected>embedding</option>
        {/if}
        {#each items as item}
            <option>{item}</option>
        {/each}
    </select>
    <!-- <span class="text-xs pl-1">{label}</span> -->
</div>
