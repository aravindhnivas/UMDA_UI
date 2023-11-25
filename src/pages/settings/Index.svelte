<script>
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';
    import Sidebar from './comp/Sidebar.svelte';
    import { Configuration, Console, About, Update } from '.';

    const partition = 20;
</script>

<Page id="Settings">
    <svelte:fragment slot="body">
        <Pane class="flex justify-center items-baseline" size={partition} minSize={15} maxSize={50}>
            <Sidebar />
        </Pane>
        <Pane minSize={50} maxSize={90}>
            <Configuration />
            <Console />
            <About />
            <Update />
        </Pane>
    </svelte:fragment>
</Page>
