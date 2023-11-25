<script lang="ts">
    import { terminal_log } from '$settings/utils/stores';
    import { git_url } from '$lib/utils/index';
    import Layout from './comp/Layout.svelte';
    import TerminalBox from '$lib/components/TerminalBox.svelte';

    let terminalDiv: HTMLDivElement;
    // let terminal: LOGGER;

    onMount(async () => {
        const [err, result] = await oO(axios(`${git_url.usercontent()}/src/requirements.txt`));
        if (!terminalDiv) {
            throw new Error('Terminal div not found');
        }
        terminal_log.init(terminalDiv);
        // term.open(terminalDiv);
        console.log('Terminal opened');
        // output a information, warning and error
        result?.data.split('\n').forEach((line: string) => {
            if (!line) return;
            terminal_log.info(line);
            terminal_log.warn(line);
            terminal_log.error(line);
            terminal_log.success(line);
        });
        terminal_log.success('Success');
    });
</script>

<Layout id="Console" class="pl-5">
    <TerminalBox bind:terminalDiv bind:terminal={$terminal_log} />
</Layout>
