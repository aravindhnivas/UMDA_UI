<script>
    import { Toaster } from 'svelte-sonner';
    import * as pages from './pages';
    import Nav from '$lib/layouts/Nav.svelte';
    import Footer from '$lib/layouts/Footer.svelte';
    import PreModal from '$utils/PreModal.svelte';
    import Modal from '$lib/components/modal/Modal.svelte';
</script>

<Toaster />
<PreModal />
<Modal />
<div class="parent w-full h-full">
    <header><Nav /></header>
    <main>
        {#each Object.keys(pages) as name}
            <svelte:component this={pages[name]} />
        {/each}
    </main>
    <footer><Footer /></footer>
</div>

<style lang="scss">
    .parent {
        display: grid;
        grid-template-rows: auto 1fr auto;
        grid-template-columns: 1fr;
        gap: 0.5em;
    }

    main {
        display: grid;
        overflow: auto;
        height: 100%;
    }
</style>
