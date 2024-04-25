<script lang="ts">
    import { running_processes, running_processes_pids, running_processes_count } from '$settings/utils/stores';
    import { Alert } from '$utils/stores';
    import { fade } from 'svelte/transition';
    import MenuSurface from '@smui/menu-surface';
    import { CheckCheck, ChevronUpCircle, CircleOff, CircleX, ScanSearch } from 'lucide-svelte/icons';
    let surface: MenuSurface; // MenuSurfaceComponentDev
</script>

{#if $running_processes_pids.length > 0}
    <MenuSurface
        style="background-color: #fff; position: fixed;"
        bind:this={surface}
        anchorCorner="BOTTOM_START"
        anchorMargin={{ top: 0, right: 50, bottom: 0, left: 0 }}
    >
        <div class="overflow-x-auto">
            <table class="table table-xs">
                <thead>
                    <tr>
                        <th></th>
                        <th>pid</th>
                        <th>pyfile</th>
                        <th>status</th>
                        <th>logs</th>
                        <th>close</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $running_processes_pids as pid, i}
                        {@const process = $running_processes[pid]}
                        <tr>
                            <th>{i}</th>
                            <td>{pid}</td>
                            <td>{process.pyfile}</td>
                            <td>
                                {#if process.aborted}
                                    <span style="color: red;">Error/Aborted</span>
                                {:else if process.completed}
                                    <span style="color: green;">completed</span>
                                {:else}
                                    {process?.progress ? `(${process?.progress} %)` : ''}
                                {/if}
                            </td>
                            <td
                                on:click={() => {
                                    console.warn('logs', process.logs, process.aborted);
                                    if (!process.logs) return Alert.info('No logs available');
                                    if (process.aborted) {
                                        Alert.error(process.logs);
                                    } else {
                                        Alert.info(process.logs);
                                    }
                                }}
                            >
                                <div class="flex justify-center cursor-pointer">
                                    <ScanSearch />
                                </div>
                            </td>
                            {#if process.completed}
                                <td
                                    class="flex cursor-pointer justify-center"
                                    on:click={() => running_processes.remove(pid)}
                                >
                                    <CircleX />
                                </td>
                            {:else}
                                <td
                                    style={process?.close?.style}
                                    on:click={() => {
                                        process?.close?.cb();
                                    }}>{process.close?.name}</td
                                >
                            {/if}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
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

        <span style="color: green;"><CheckCheck /> {$running_processes_count.completed}</span>
        <span class=" text-red-700"><CircleOff /> {$running_processes_count.aborted}</span>
    </div>
{/if}
