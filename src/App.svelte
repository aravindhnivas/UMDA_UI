<script lang="ts">
    import { RAM_SIZE, CPU_COUNT, NPARTITIONS } from '$lib/stores/system';
    import { Toaster } from 'svelte-sonner';
    import * as pages from './pages';
    import Footer from '$lib/layouts/Footer.svelte';
    import PreModal from '$utils/PreModal.svelte';
    import CustomTabs from '$lib/components/CustomTabs.svelte';
    import { active_tab } from '$utils/stores';

    const tabs = ['Home', 'Training', 'Settings'];

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
        <CustomTabs {tabs} bind:active={$active_tab} />
    </header>
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
