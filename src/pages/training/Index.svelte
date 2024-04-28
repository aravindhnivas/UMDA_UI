<script lang="ts">
    // import { Loadingbtn } from '$lib/components/';
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';
    import { Embedding, Mol2VecTrain, PCATrain } from '.';

    const sidebar_items = ['Mol2Vec', 'PCA', 'Embedding'];
    let active_item = sidebar_items[0];
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<Page id="Training">
    <svelte:fragment slot="body">
        <Pane class="p-2" size={15} minSize={10} maxSize={20}>
            <ul class="menu rounded-box gap-1">
                {#each sidebar_items as item}
                    <li on:click={() => (active_item = item)}>
                        <span class:active={active_item == item}>{item}</span>
                    </li>
                {/each}
            </ul>
        </Pane>
        <Pane minSize={80}>
            <div class="p-4 overflow-auto max-h-[80vh]">
                <Embedding display={active_item.toLowerCase() === 'embedding' ? '' : 'none'} />
                <Mol2VecTrain display={active_item.toLowerCase() === 'mol2vec' ? '' : 'none'} />
                <PCATrain display={active_item.toLowerCase() === 'pca' ? '' : 'none'} />
            </div>
        </Pane>
    </svelte:fragment>
</Page>
