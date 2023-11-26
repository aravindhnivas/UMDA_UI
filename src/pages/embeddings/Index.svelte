<script lang="ts">
    import { LoadingBtn } from '$lib/components/';
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';
</script>

<Page id="Embeddings">
    <svelte:fragment slot="body">
        <Pane class="p-5">
            <h1 class="text-3xl font-bold">Embeddings</h1>
            <button class="btn btn-sm">Click</button>
        </Pane>
    </svelte:fragment>
</Page>
