<script lang="ts">
    import { RAM_SIZE, CPU_COUNT, NPARTITIONS } from '$lib/stores/system';
    import { Toaster } from 'svelte-sonner';
    import * as pages from './pages';
    import Footer from '$lib/layouts/Footer.svelte';
    import PreModal from '$utils/PreModal.svelte';
    import { active_tab } from '$utils/stores';
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { typeSafeObjectKeys } from '$lib/utils';
    import { Home, Settings, Binary } from 'lucide-svelte/icons';
    import type { SvelteComponent } from 'svelte';

    const nav_tabs = {
        Home: Home,
        Training: Binary,
        Settings: Settings,
    } as Record<string, typeof SvelteComponent>;

    onMount(async () => {
        const [total_memory, cpu_count] = await invoke<[number, number]>('get_sysinfo');
        RAM_SIZE.set(total_memory / 1024 / 1024 / 1024);
        CPU_COUNT.set(cpu_count);

        console.log('RAM_SIZE', $RAM_SIZE);
        console.log('CPU_COUNT', $CPU_COUNT);

        const cpu_npartitions = $CPU_COUNT * 5;
        const ram_npartitions = (($RAM_SIZE - 4) * 1024) / 200;
        const max_npartitions = Math.max(cpu_npartitions, ram_npartitions, 50);

        NPARTITIONS.set(Math.floor(max_npartitions));
    });
</script>

<Toaster position="bottom-left" richColors />
<PreModal />
<div class="parent w-full h-full">
    <header class="bg-orange-300/50 shadow-xl">
        <TabBar tabs={Object.keys(nav_tabs)} let:tab bind:active={$active_tab}>
            <Tab {tab}>
                <Label>
                    <div class="flex gap-2 items-center">
                        <svelte:component this={nav_tabs[tab]} />
                        <span>{tab}</span>
                    </div>
                </Label>
            </Tab>
        </TabBar>
    </header>
    <main>
        {#each typeSafeObjectKeys(pages) as name}
            <svelte:component this={pages[name]} />
        {/each}
    </main>
    <footer><Footer /></footer>
</div>

<style>
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
