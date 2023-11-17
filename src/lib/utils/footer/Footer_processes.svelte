<script lang="ts">
    import { running_processes } from '$settings/utils/stores';
    import { fade } from 'svelte/transition';
    import MenuSurface from '@smui/menu-surface';
    let surface: any; // MenuSurfaceComponentDev
</script>

{#if $running_processes.length > 0}
    <MenuSurface
        style="background-color: #fff; position: fixed;"
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
                        <th>pid</th>
                        <th>pyfile</th>
                        <th>close</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $running_processes as process, i}
                        <tr>
                            <th>{i}</th>
                            <td>{process.pid}</td>
                            <td>{process.pyfile}</td>
                            <td
                                style={process?.close?.style}
                                on:click={() => {
                                    process?.close?.cb();
                                }}>{process.close?.name}</td
                            >
                        </tr>
                    {/each}
                </tbody>
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
{/if}
