<script lang="ts">
    import LinearProgress from '@smui/linear-progress';
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';

    export let data: {
        columns: string[];
        nrows: {
            [key: string]: string | number;
        }[];
        shape: number;
    } | null = null;
    export let loading = false;
</script>

{#if data}
    {#if data?.columns && data?.nrows}
        <div class="alert text-sm p-1">
            <span>Total {data.shape} rows: {data?.nrows.length} rows are displayed below</span>
        </div>
        <div class="overflow-x-auto">
            <DataTable style="width: 100%; max-height: 500px;">
                <Head>
                    <Row>
                        <Cell></Cell>
                        {#each data.columns as column}
                            <Cell><span class="select-text">{column}</span></Cell>
                        {/each}
                    </Row>
                </Head>
                <Body>
                    {#each data.nrows as nrows, index}
                        <Row>
                            <Cell>{index}</Cell>
                            {#each data.columns as column}
                                <Cell>{nrows[column]}</Cell>
                            {/each}
                        </Row>
                    {/each}
                </Body>
                <LinearProgress indeterminate closed={!loading} aria-label="Data is being loaded..." slot="progress" />
            </DataTable>
        </div>
    {/if}
{/if}
