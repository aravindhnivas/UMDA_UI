<script>
    import Main from '$lib/layouts/Main.svelte';
    import Nav from '$lib/layouts/Nav.svelte';
    import Footer from '$lib/layouts/Footer.svelte';
    import { active_tab } from '$utils/stores';
</script>

<div class="parent w-full h-full">
    <header><Nav /></header>
    <div class="left-side section border-solid border-0 border-r-1">Left Sidebar</div>
    <main>
        <Main />
    </main>
    <div class="right-side section border-solid border-0 border-l-1">Right Sidebar</div>
    <footer><Footer /></footer>
</div>

<style lang="scss">
    .parent {
        display: grid;
        grid-template: auto 1fr auto / auto 1fr auto;
        overflow-y: auto;
    }

    header,
    footer,
    .left-side,
    .right-side,
    main {
        padding: 0.5rem;
    }

    .left-side,
    .right-side,
    main {
        overflow: auto;
    }

    main {
        grid-column: 2 / 3;
    }

    header {
        grid-column: 1 / 4;
    }

    .left-side {
        grid-column: 1 / 2;
    }

    .right-side {
        grid-column: 3 / 4;
    }

    footer {
        grid-column: 1 / 4;
        padding: 0;
    }
</style>
