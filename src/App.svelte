<script lang="ts">
    import { RAM_SIZE, CPU_COUNT, NPARTITIONS, fontSize } from '$lib/stores/system';
    import { Toaster } from 'svelte-sonner';
    import * as pages from './pages';
    import Footer from '$lib/layouts/Footer.svelte';
    import PreModal from '$utils/PreModal.svelte';
    import { active_tab } from '$utils/stores';
    import { typeSafeObjectKeys } from '$lib/utils';
    import { Home, Settings, Binary } from 'lucide-svelte/icons';
    import type { SvelteComponent } from 'svelte';
    import { os } from '@tauri-apps/api';
    import CustomTabs from '$lib/components/CustomTabs.svelte';

    const nav_tabs = [
        { tab: 'Home', component: Home },
        { tab: 'Training', component: Binary },
        { tab: 'Settings', component: Settings },
    ] as { tab: string; component: typeof SvelteComponent }[];

    let html: HTMLElement;

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
        html = document.getElementsByTagName('html')[0];
    });

    $: if (html && $fontSize && $fontSize < 25 && $fontSize > 5) {
        html.style.fontSize = `${$fontSize}px`;
    }

    async function handleKeydown(event: KeyboardEvent) {
        const platform = await os.platform();
        const cond = platform === 'darwin' ? event.metaKey : event.ctrlKey;
        if (cond && event.key === '=') {
            $fontSize += 1;
        } else if (cond && event.key === '-') {
            $fontSize -= 1;
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<Toaster position="bottom-left" richColors />
<PreModal />
<div class="parent w-full h-full">
    <header class=" shadow-xl p-2">
        <CustomTabs tabs={nav_tabs} bind:active={$active_tab} />
    </header>
    <main>
        {#each typeSafeObjectKeys(pages) as name}
            <svelte:component this={pages[name]} />
        {/each}
    </main>
    <footer class="border-t border-t-black"><Footer /></footer>
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
