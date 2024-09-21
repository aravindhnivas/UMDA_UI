<script lang="ts">
    import { running_processes_pids, running_processes_count } from '$settings/utils/stores';

    import { fade } from 'svelte/transition';
    import MenuSurface from '@smui/menu-surface';
    import { CheckCheck, ChevronUpCircle, CircleOff } from 'lucide-svelte/icons';
    import ProcessTable from './ProcessTable.svelte';

    let surface: MenuSurface; // MenuSurfaceComponentDev
</script>

{#if $running_processes_pids.length > 0}
    <MenuSurface
        style="background-color: #fff; position: fixed;"
        bind:this={surface}
        anchorCorner="BOTTOM_START"
        anchorMargin={{ top: 0, right: 50, bottom: 0, left: 0 }}
    >
        <ProcessTable />
    </MenuSurface>
    <div
        transition:fade
        role="presentation"
        class="flex navbar-item gap-2 items-center text-xs"
        style="cursor: pointer;"
        on:click={() => {
            surface.setOpen(true);
        }}
    >
        <ChevronUpCircle />
        {#if $running_processes_count.running > 0}
            <span
                >Running {$running_processes_count.running}
                {$running_processes_count.running > 1 ? 'processes' : 'process'}</span
            >
        {/if}
        <span class="flex items-center gap-1" style="color: green;"
            ><CheckCheck /> {$running_processes_count.completed}</span
        >
        <span class="flex items-center gap-1 text-red-700"><CircleOff /> {$running_processes_count.aborted}</span>
    </div>
{/if}
