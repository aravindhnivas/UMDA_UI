<script lang="ts">
    import { LOGGER } from '$lib/utils/logger';
    export let terminal: LOGGER;

    let className = '';
    export { className as class };
    export let terminalDiv: HTMLDivElement;
</script>

<button class="btn ml-auto" on:click={() => terminal?.term.clear()}>Clear</button>
<div class={className} bind:this={terminalDiv}></div>
