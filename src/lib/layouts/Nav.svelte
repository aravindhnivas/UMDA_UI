<script lang="ts">
    import { active_tab } from '$utils/stores';
    let tabs = ['Home', 'Training', 'Settings'];
</script>

<div class="flex tabs tabs-boxed bg-orange-300/50 shadow-xl">
    {#each tabs as tab (tab)}
        <button class="tab" class:tab-active={$active_tab === tab} on:click={() => ($active_tab = tab)}>
            {tab}
        </button>
    {/each}
</div>
