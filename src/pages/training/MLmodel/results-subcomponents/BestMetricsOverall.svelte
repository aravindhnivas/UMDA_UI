<script lang="ts">
    import { read_csv } from '$lib/utils';
    import { best_metrics_loc } from '$pages/training/training_file/plot-analysis/stores';

    let csv_filenames: string[] = [];
    let selected_csv_file: string = '';

    const fetch_all_csv_files = async (loc: string) => {
        if (!(await fs.exists(loc))) return;
        const csv_files = await fs.readDir(loc);
        csv_filenames = csv_files.map(file => file.name);

        selected_csv_file ||= csv_filenames[0];
    };

    const read_current_csv_file = async (filename: string) => {
        const csv_file = await path.join($best_metrics_loc, filename);
        if (!(await fs.exists(csv_file))) return;
        const contents = await read_csv(csv_file);
        // console.log(contents);
        if (!contents) return;
        data = contents.data;
        columns = contents.columns;
    };

    let columns: string[] = [];
    let data: string[][] = [];
    $: fetch_all_csv_files($best_metrics_loc);
    $: selected_csv_file && read_current_csv_file(selected_csv_file);
</script>

<div class="flex flex-wrap gap-2">
    {#each csv_filenames as csv (csv)}
        <button
            class="btn btn-sm btn-outline"
            class:btn-active={selected_csv_file === csv}
            on:click={() => {
                selected_csv_file = csv;
            }}>{csv.replace('.csv', '')}</button
        >
    {/each}
</div>

<div class="overflow-x-auto w-full" style="height: 500px;">
    {#if data.length > 0}
        <table class="table bg-base-100">
            <thead>
                <tr>
                    <th></th>
                    {#each columns as column}
                        <th>{@html column}</th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each data as row, index (row)}
                    <tr class="hover:bg-base-200">
                        <th>{index}</th>
                        {#each row as val, i ([...row, i, index])}
                            <td class="select-text">{val}</td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
