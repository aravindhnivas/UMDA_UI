<script lang="ts">
    import { terminal_log } from '$settings/utils/stores';
    import { git_url } from '$lib/utils/index';
    import Layout from './comp/Layout.svelte';
    import TerminalBox from '$lib/components/TerminalBox.svelte';

    let terminalDiv: HTMLDivElement;
    onMount(() => {
        terminal_log.init(terminalDiv);
        terminal_log.info('Console ready');
    });
</script>

<Layout id="Console" class="pl-5">
    <TerminalBox bind:terminalDiv bind:terminal={$terminal_log} />
</Layout>
