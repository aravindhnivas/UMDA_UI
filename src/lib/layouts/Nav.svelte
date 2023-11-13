<script>
    import { active_tab } from '$lib/utils/stores';
    let tabs = [
        { id: crypto.randomUUID(), name: 'Tab 1' },
        { id: crypto.randomUUID(), name: 'Tab 2' },
        { id: crypto.randomUUID(), name: 'Tab 3' },
    ];
</script>

<div class="tabs tabs-boxed bg-orange-200">
    {#each tabs as tab (tab.id)}
        <div
            class="tab"
            class:tab-active={$active_tab === tab.name}
            on:click={() => ($active_tab = tab.name)}
        >
            {tab.name}
        </div>
    {/each}
</div>
