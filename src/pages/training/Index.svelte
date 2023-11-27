<script lang="ts">
    // import { Loadingbtn } from '$lib/components/';
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';
    import { Data, Training } from '.';
    const sidebar_items = ['Data', 'Training', 'Test'];

    let active_item = 'data';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<Page id="Training">
    <svelte:fragment slot="body">
        <Pane class="p-2" size={15} minSize={10} maxSize={20}>
            <ul class="menu rounded-box">
                {#each sidebar_items as item}
                    <li on:click={() => (active_item = item)}><span>{item}</span></li>
                {/each}
            </ul>
        </Pane>
        <Pane class="p-2" minSize={80}>
            <Data id="training_data__comp" display={active_item.toLowerCase() === 'data' ? '' : 'none'} />
            <Training id="training_training__comp" display={active_item.toLowerCase() === 'training' ? '' : 'none'} />
        </Pane>
    </svelte:fragment>
</Page>
