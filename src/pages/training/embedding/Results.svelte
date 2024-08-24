<script lang="ts">
    import { CheckCheck } from 'lucide-svelte/icons';
    import { training_column_name_X } from '../training_file/stores';
    import VirtualList from '@sveltejs/svelte-virtual-list';

    export let computed_time: string;
    export let data: {
        name: string;
        shape: number;
        invalid_smiles: string[];
        saved_file: string;
    } | null = null;
</script>

{#if data}
    {@const { invalid_smiles, saved_file } = data}
    {@const invalid_smiles_indexed = invalid_smiles.map((smiles, ind) => ({ smiles, ind }))}
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
            <VirtualList height="300px" items={invalid_smiles_indexed} let:item>
                <span class="select-text text-wrap break-all">{item.ind + 1}: {item.smiles}</span>
            </VirtualList>
        {/if}
    </div>
{/if}
