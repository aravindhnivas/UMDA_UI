<script lang="ts">
    import { running_processes, running_processes_pids } from '$settings/utils/stores';
    import { Alert } from '$utils/stores';
    import { ScanSearch, CircleX, CircleCheck, CircleAlert } from 'lucide-svelte/icons';

    // Function to compute duration in minutes
    function computeDuration(start?: string, end?: string) {
        if (!start || !end) return '-';

        const startTime = new Date(start);
        const endTime = new Date(end);
        const durationMs = Number(endTime) - Number(startTime);
        // const durationMinutes = Math.floor(durationMs / 60000);
        const durationMinutes = (durationMs / 60000).toFixed(2);
        return durationMinutes;
    }
</script>

<div class="overflow-x-auto">
    <table class="table table-xs">
        <thead>
            <tr>
                <th></th>
                <th>PID</th>
                <th>PYFILE</th>
                <th>START_TIME</th>
                <th>END_TIME</th>
                <th>DURATION (MINS)</th>
                <th>STATUS</th>
                <th>LOGS</th>
                <th>CLOSE</th>
            </tr>
        </thead>
        <tbody>
            {#each $running_processes_pids as pid, i}
                {@const process = $running_processes[pid]}
                <tr>
                    <th>{i}</th>
                    <td>{pid}</td>
                    <td>{process.pyfile}</td>

                    <td>{process.start_time || '-'}</td>
                    <td>{process.end_time || '-'}</td>
                    <td class="text-center">{computeDuration(process.start_time, process.end_time)}</td>
                    <td class="text-center">
                        {#if process.aborted}
                            <span style="color: red;"><CircleAlert /></span>
                        {:else if process.completed}
                            <span style="color: green;"><CircleCheck /></span>
                        {:else}
                            {process?.progress ? `(${process?.progress} %)` : 'running...'}
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
                        <div class="flex justify-center cursor-pointer hvr-grow hover:bg-gray-200 border-rounded">
                            <ScanSearch />
                        </div>
                    </td>
                    {#if process.completed}
                        <td
                            class="flex cursor-pointer justify-center hover:bg-red-400 border-rounded"
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
