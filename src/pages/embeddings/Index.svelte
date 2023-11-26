<script lang="ts">
    import { LoadingBtn } from '$lib/components/';
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';

    let progress = 0.1;
    let loading = true;
</script>

<Page id="Embeddings">
    <svelte:fragment slot="body">
        <Pane class="p-5">
            <h1 class="text-3xl font-bold">Embeddings</h1>
            <LoadingBtn
                name="Click me"
                {loading}
                on:click={() => {
                    progress += 0.05;
                }}
            />
            <progress class="progress w-full" value={progress} max="1"></progress>
        </Pane>
    </svelte:fragment>
</Page>
