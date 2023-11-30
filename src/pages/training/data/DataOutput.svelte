<script lang="ts">
    import LinearProgress from '@smui/linear-progress';
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    export let data: DataType;
    export let loading: boolean = false;
</script>

{#if data?.columns && data?.head}
    <div class="alert text-sm p-1">
        <span>Total {data.shape} rows: First 10 rows are displayed below</span>
    </div>
    <div class="overflow-x-auto">
        <DataTable table$aria-label="User list" style="width: 100%;">
            <Head>
                <Row>
                    <Cell></Cell>
                    {#each data.columns as column}
                        <Cell>{column}</Cell>
                    {/each}
                </Row>
            </Head>
            <Body>
                {#each data.head as head, index}
                    <Row class="hover:bg-orange-300">
                        <Cell>{index}</Cell>

                        {#each data.columns as column}
                            <Cell>{head[column]}</Cell>
                        {/each}
                    </Row>
                {/each}
            </Body>

            <LinearProgress indeterminate closed={!loading} aria-label="Data is being loaded..." slot="progress" />
        </DataTable>
    </div>
{/if}
