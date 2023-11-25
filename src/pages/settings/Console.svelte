<script lang="ts">
    import { LOGGER } from '$lib/utils/logger';
    import { git_url } from '$lib/utils/index';
    import Layout from './comp/Layout.svelte';

    let terminalDiv: HTMLDivElement;

    onMount(async () => {
        const [err, result] = await oO(axios(`${git_url.usercontent()}/src/requirements.txt`));
        if (!terminalDiv) {
            throw new Error('Terminal div not found');
        }

        const terminal = new LOGGER(terminalDiv);
        // term.open(terminalDiv);
        console.log('Terminal opened');
        // output a information, warning and error
        result?.data.split('\n').forEach((line: string) => {
            if (!line) return;
            terminal.info(line);
            terminal.warning(line);
            terminal.error(line);
            terminal.success(line);
        });
        terminal.success('Success');
    });
</script>

<Layout id="Console" class="pl-5">
    <div id="terminal" bind:this={terminalDiv}></div>
</Layout>

<style lang="scss">
    #terminal {
        height: 500px;
    }
</style>
