<script lang="ts">
    // import { Loadingbtn } from '$lib/components/';
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';
    import { Embedding, Mol2VecTrain, VICGAETrain, PCATrain } from '.';

    const sidebar_items = ['Mol2Vec', 'VICGAE', 'PCA', 'Embedding'];
    let active_item = sidebar_items[0];
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<Page id="Training">
    <svelte:fragment slot="body">
        <Pane class="p-2" size={15} minSize={10} maxSize={20}>
            <ul class="menu rounded-box">
                <!-- <li><a>Item 1</a></li> -->
                <li>
                    <details open>
                        <summary>Train Embedder</summary>
                        <ul>
                            <li on:click={() => (active_item = 'Mol2Vec')}>
                                <span class:active={active_item == 'Mol2Vec'}>Mol2Vec</span>
                            </li>
                            <li on:click={() => (active_item = 'VICGAE')}>
                                <span class:active={active_item == 'VICGAE'}>VICGAE</span>
                            </li>
                            <li on:click={() => (active_item = 'PCA')}>
                                <span class:active={active_item == 'PCA'}>PCA</span>
                            </li>
                        </ul>
                    </details>
                </li>
                <li on:click={() => (active_item = 'Embedding')}>
                    <span class:active={active_item == 'Embedding'}>Embedding</span>
                </li>
            </ul>
        </Pane>
        <Pane minSize={80}>
            <div class="p-4 overflow-auto max-h-[80vh]">
                <Embedding display={active_item.toLowerCase() === 'embedding' ? '' : 'none'} />
                <Mol2VecTrain display={active_item.toLowerCase() === 'mol2vec' ? '' : 'none'} />
                <VICGAETrain display={active_item.toLowerCase() === 'vicgae' ? '' : 'none'} />
                <PCATrain display={active_item.toLowerCase() === 'pca' ? '' : 'none'} />
            </div>
        </Pane>
    </svelte:fragment>
</Page>
