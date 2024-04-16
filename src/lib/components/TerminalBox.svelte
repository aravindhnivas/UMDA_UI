<script lang="ts">
    import { LOGGER } from '$lib/utils/logger';

    export let terminal: LOGGER;
    let className = '';
    export { className as class };

    const mount = (node: HTMLElement) => {
        terminal = new LOGGER(node, { fontSize: 14, fontFamily: 'monospace' });
    };
    onDestroy(() => terminal?.term.dispose());
</script>

<button class="btn btn-sm ml-auto" on:click={() => terminal?.term.clear()}>Clear</button>
<div class={className} use:mount></div>
