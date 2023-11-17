<script lang="ts">
    import { running_processes } from '$settings/utils/stores';
    import { fade } from 'svelte/transition';
    // import { STable } from '$lib/components'
    import MenuSurface from '@smui/menu-surface';
    // import type { MenuSurfaceComponentDev } from '@smui/menu-surface'

    let surface: any; // MenuSurfaceComponentDev
</script>

<!-- {#if $running_processes.length > 0} -->
<MenuSurface
    style="background: var(--background-color);"
    bind:this={surface}
    anchorCorner="BOTTOM_START"
    anchorMargin={{ top: 0, right: 50, bottom: 0, left: 0 }}
>
    <!-- <STable idKey="pid" rows={$running_processes} rowKeys={['pid', 'pyfile', 'close']} /> -->
    <div class="overflow-x-auto">
        <table class="table table-xs">
            <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Job</th>
                    <th>company</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>1</th>
                    <td>Cy Ganderton</td>
                    <td>Quality Control Specialist</td>
                </tr>
                <tr>
                    <th>2</th>
                    <td>Hart Hagerty</td>
                    <td>Desktop Support Technician</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Job</th>
                    <th>company</th>
                </tr>
            </tfoot>
        </table>
    </div>
</MenuSurface>
<div
    transition:fade
    role="presentation"
    class="navbar-item"
    style="cursor: pointer;"
    on:click={() => surface.setOpen(true)}
>
    Running {$running_processes.length}
    {$running_processes.length > 1 ? 'processes' : 'process'}
</div>
<!-- {/if} -->
