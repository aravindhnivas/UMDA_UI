<script>
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';
</script>

<Page id="Home">
    <svelte:fragment slot="body">
        <Pane class="p-2">
            <div class="hero h-full">
                <div class="hero-content text-center">
                    <div class="max-w-md">
                        <h1 class="text-5xl font-bold">UMDA - UI</h1>
                        <p class="py-6">Unsupervised Molecule Discovery in Astrophysics - User Interface</p>
                        <button class="btn btn-sm btn-outline">Get Started</button>
                    </div>
                </div>
            </div>
        </Pane>
    </svelte:fragment>
</Page>
