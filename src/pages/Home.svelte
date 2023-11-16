<script>
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';
    console.log('Home page');
</script>

<Page id="Home">
    <svelte:fragment slot="body">
        <Pane size={100}>
            <span>Home page contents</span>
        </Pane>
    </svelte:fragment>
</Page>
