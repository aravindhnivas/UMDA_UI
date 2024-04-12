<script lang="ts">
    import Loadingbtn from '$lib/components/Loadingbtn.svelte';
    import { sleep } from '$lib/utils/initialise';
    import { writable } from '@macfja/svelte-persistent-store';
    export let columns: string[] = [];

    const auto_fetch_columns = writable('auto_fetch_columns', false);
    // $: console.log(auto_fetch_columns);
    let df_column = '';
    const embeddings = ['mol2vec', 'VICGAE'];
    let embedding = embeddings[0];
</script>

<h2>Embeddings</h2>

<div class="flex flex-col gap-1">
    <div class="flex-center">
        <span>Auto-fetch column name</span>
        <input type="checkbox" class="toggle" bind:checked={$auto_fetch_columns} />
    </div>
    {#if $auto_fetch_columns && !columns.length}
        <span class="text-sm">Load file first!</span>
    {/if}
</div>

<div class="flex-center">
    {#if $auto_fetch_columns}
        <select class="select select-sm select-bordered" bind:value={df_column}>
            <option disabled selected>Column</option>
            {#each columns as column}
                <option>{column}</option>
            {/each}
        </select>
    {:else}
        <input type="text" class="input input-sm" bind:value={df_column} placeholder="Enter column name" />
    {/if}

    <select class="select select-sm select-bordered" bind:value={embedding}>
        <option disabled selected>embedding</option>
        {#each embeddings as embed}
            <option>{embed}</option>
        {/each}
    </select>

    <Loadingbtn
        name="Compute"
        callback={async () => {
            await sleep(10000);
            return true;
        }}
    />
</div>
