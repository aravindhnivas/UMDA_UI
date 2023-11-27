<script lang="ts">
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    export let data: any = {};
</script>

{#if data.columns && data.head}
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

            <!-- <LinearProgress
    indeterminate
    bind:closed={loaded}
    aria-label="Data is being loaded..."
    slot="progress"
  /> -->
        </DataTable>
    </div>
{/if}
