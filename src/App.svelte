<script>
    // import '$lib/utils/initialise';
    import { Toaster } from 'svelte-sonner';
    import Home from './pages/Home.svelte';
    import Settings from './pages/settings';
    import Nav from '$lib/layouts/Nav.svelte';
    import Footer from '$lib/layouts/Footer.svelte';
    import PreModal from '$utils/PreModal.svelte';
    // import { Alert } from '$utils/stores';
    // onMount(() => {
    //     Alert.error('Welcome to UMDAUI');
    //     console.log('mounted');
    // });
</script>

<Toaster />
<PreModal />

<div class="parent w-full h-full">
    <header><Nav /></header>
    <main>
        <Home />
        <Settings />
    </main>
    <footer><Footer /></footer>
</div>

<style lang="scss">
    .parent {
        display: grid;
        grid-template-rows: auto 1fr auto;
        // overflow-y: auto;
    }

    header,
    footer,
    main {
        padding: 0.5rem;
    }

    main {
        display: grid;
        overflow: auto;
    }

    main {
        grid-column: 1 / 4;
    }

    header {
        grid-column: 1 / 4;
    }
    footer {
        grid-column: 1 / 4;
        padding: 0;
    }
</style>
