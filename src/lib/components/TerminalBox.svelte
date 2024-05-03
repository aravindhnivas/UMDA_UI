<script lang="ts">
    import { LOGGER } from '$lib/utils/logger';

    export let terminal: LOGGER;
    let className = '';
    export { className as class };

    const mount = (node: HTMLElement) => {
        terminal = new LOGGER(node, { fontSize: 14, fontFamily: 'monospace' });
        terminal.fitAddon.fit();
    };
    onDestroy(() => terminal?.term.dispose());
</script>

<button
    class="btn btn-sm ml-auto"
    on:click={() => {
        if (!terminal) return toast.error('Terminal not initialized');
        terminal.term.clear();
        terminal.warn('Terminal cleared by user!!');
    }}>Clear</button
>
<div class="{className} w-full" use:mount></div>
