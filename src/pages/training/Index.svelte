<script lang="ts">
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';
    import { Embedding, Mol2VecTrain, VICGAETrain, PCATrain, MLmodelTrain, TrainingFile } from '.';
    import { ConstructionIcon } from 'lucide-svelte';

    let active_item = 'Mol2Vec';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<Page id="Training">
    <svelte:fragment slot="body">
        <Pane class="p-2" size={20} minSize={10} maxSize={20}>
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
                                <span class:active={active_item == 'VICGAE'}>
                                    <span>VICGAE</span>
                                    <ConstructionIcon />
                                </span>
                            </li>
                            <li on:click={() => (active_item = 'PCA')}>
                                <span class:active={active_item == 'PCA'}>PCA</span>
                            </li>
                        </ul>
                    </details>
                </li>
                <li on:click={() => (active_item = 'training_file')}>
                    <span class:active={active_item == 'training_file'}>Training File</span>
                </li>
                <li on:click={() => (active_item = 'Embedding')}>
                    <span class:active={active_item == 'Embedding'}>Embedding</span>
                </li>
                <li on:click={() => (active_item = 'ML_Model')}>
                    <span class:active={active_item == 'ML_Model'}>ML Model</span>
                </li>
            </ul>
        </Pane>
        <Pane minSize={80}>
            <div class="overflow-auto max-h-[100%] p-2">
                <Mol2VecTrain display={active_item.toLowerCase() === 'mol2vec' ? '' : 'none'} />
                <VICGAETrain display={active_item.toLowerCase() === 'vicgae' ? '' : 'none'} />
                <PCATrain display={active_item.toLowerCase() === 'pca' ? '' : 'none'} />
                <TrainingFile display={active_item.toLowerCase() === 'training_file' ? '' : 'none'} />
                <Embedding display={active_item.toLowerCase() === 'embedding' ? '' : 'none'} />
                <MLmodelTrain display={active_item.toLowerCase() === 'ml_model' ? '' : 'none'} />
            </div>
        </Pane>
    </svelte:fragment>
</Page>
