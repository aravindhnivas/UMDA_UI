<script lang="ts">
    import Loadingbtn from '$lib/components/LoadingBtn.svelte';
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';

    let progress = 0.5;
</script>

<Page id="Embeddings">
    <svelte:fragment slot="body">
        <Pane class="p-5">
            <h1 class="text-3xl font-bold">Embeddings</h1>
            <Loadingbtn name="Click me" loading={false} on:click={() => (progress += 0.1)} />
            <progress class="progress w-full" value={progress} max="1"></progress>
        </Pane>
    </svelte:fragment>
</Page>
