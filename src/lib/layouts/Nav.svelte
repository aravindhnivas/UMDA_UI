<script>
    import { active_tab } from '$utils/stores';
    let tabs = [
        { id: crypto.randomUUID(), name: 'Home' },
        { id: crypto.randomUUID(), name: 'Settings' },
    ];
</script>

<div class="tabs tabs-boxed bg-orange-300 bg-opacity-50 shadow-xl">
    {#each tabs as tab (tab.id)}
        <div class="tab" class:tab-active={$active_tab === tab.name} on:click={() => ($active_tab = tab.name)}>
            {tab.name}
        </div>
    {/each}
</div>
