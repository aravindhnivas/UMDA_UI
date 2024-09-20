<script lang="ts">
    export let tabs: string[];
    export let active: string;
</script>

<div class="flex tabs tabs-boxed bg-orange-300/50 shadow-xl">
    {#each tabs as tab (tab)}
        <button class="tab" class:tab-active={active === tab} on:click={() => (active = tab)}>
            {tab}
        </button>
    {/each}
</div>
