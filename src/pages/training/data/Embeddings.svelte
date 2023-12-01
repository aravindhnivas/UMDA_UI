<script lang="ts">
    export let columns: string[] = [];

    let df_column = '';
    const embeddings = ['mol2vec', 'VICGAE'];
    let embedding = embeddings[0];
</script>

<h2>Embeddings</h2>
<div class="flex gap-1">
    <select class="select select-sm select-bordered" bind:value={df_column}>
        <option disabled selected>Column</option>
        {#each columns as column}
            <option>{column}</option>
        {/each}
    </select>

    <select class="select select-sm select-bordered" bind:value={embedding}>
        <option disabled selected>embedding</option>
        {#each embeddings as embed}
            <option>{embed}</option>
        {/each}
    </select>

    <button class="btn btn-sm">Compute</button>
</div>
