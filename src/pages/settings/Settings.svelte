<script>
    import { active_settings_tab } from './stores';
    import Page from '$lib/layouts/Page.svelte';
    import { Pane } from 'svelte-splitpanes';
    import Sidebar from './comp/Sidebar.svelte';
    import { Configuration, Update } from './';
</script>

<Page id="Settings">
    <svelte:fragment slot="body">
        <Pane class="flex justify-center items-baseline" size={20} minSize={20} maxSize={50}>
            <Sidebar />
        </Pane>
        <Pane minSize={50} maxSize={80}>
            <div class="m-3">
                <h3>{$active_settings_tab}</h3>
                <div class="settings__body grid w-full h-full">
                    <Configuration />
                    <Update />
                </div>
            </div>
        </Pane>
    </svelte:fragment>
</Page>
