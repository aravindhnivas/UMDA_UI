<script lang="ts">
    import { active_tab } from '$utils/stores';
    let tabs = ['Home', 'Embeddings', 'Settings'];
</script>

<div class="tabs tabs-boxed bg-orange-300 bg-opacity-50 shadow-xl">
    {#each tabs as tab (tab)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="tab" class:tab-active={$active_tab === tab} on:click={() => ($active_tab = tab)}>
            {tab}
        </div>
    {/each}
</div>
