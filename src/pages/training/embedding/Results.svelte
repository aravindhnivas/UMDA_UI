<script lang="ts">
    import { CheckCheck } from 'lucide-svelte/icons';
    import { training_column_name_X } from '../training_file/stores';

    export let data: {
        name: string;
        shape: number;
        invalid_smiles: string[];
        saved_file: string;
        computed_time: string;
    } | null = null;
</script>

{#if data}
    {@const { invalid_smiles, saved_file, computed_time } = data}
    <button class="btn btn-sm btn-error w-max ml-auto" on:click={() => (data = null)}>X</button>
    <div class=" flex flex-col gap-1">
        {#if saved_file}
            <div role="alert" class="alert alert-info p-2">
                <CheckCheck />
                <span class="text-sm">(Computed in {computed_time}) File saved to: {saved_file}</span>
            </div>
        {/if}

        {#if invalid_smiles.length > 0}
            <h3>
                Could not compute embeddings for {invalid_smiles.length}
                {$training_column_name_X}
            </h3>
            <ul class="invalid_smi_list px-4 select-text">
                {#each invalid_smiles as smiles, ind}
                    <li class="select-text">{ind + 1}: <span class="text-wrap">{smiles}</span></li>
                {/each}
            </ul>
        {/if}
    </div>
{/if}

<!-- <h3>
    Could not compute embeddings for
    {$training_column_name_X}
</h3>
<ul class="invalid_smi_list px-4 select-text">
    {#each Array(100) as item}
        <li class="select-text">{item}</li>
    {/each}
</ul> -->

<style>
    .invalid_smi_list {
        list-style-type: none;
        max-height: 300px;
        overflow: auto;
        max-width: calc(70vw - 1rem);
    }
</style>
