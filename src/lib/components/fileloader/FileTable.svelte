<script lang="ts">
    export let loading = false;
    export let data: {
        columns: string[];
        nrows: {
            [key: string]: string | number;
        }[];
        shape: number;
    } | null = null;
</script>

{#if loading}
    <p>Loading data please wait...</p>
{/if}

{#if data}
    {#if data?.columns && data?.nrows}
        <div class="alert text-sm p-1">
            <span>Total {data.shape} rows: {data?.nrows.length} rows are displayed below</span>
        </div>
        <div class="overflow-x-auto" style="height: 500px;">
            <table class="table bg-base-100">
                <thead>
                    <tr>
                        <th></th>
                        {#each data.columns as column}
                            <th>{column}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each data.nrows as nrows, index}
                        <tr class="hover:bg-base-200">
                            <th>{index}</th>
                            {#each data.columns as column}
                                <td class="select-text">{nrows[column]}</td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
{/if}
