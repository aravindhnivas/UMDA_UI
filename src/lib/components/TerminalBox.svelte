<script lang="ts">
    import VirtualList from '@sveltejs/svelte-virtual-list';

    export let terminal: LoggerStore[];
    export let height = '400px';
    let className = '';
    export { className as class };

    onMount(() => {
        console.log('TerminalBox mounted');
        terminal = [{ type: 'info', message: 'Terminal mounted' }];
    });
</script>

<button
    class="btn btn-sm ml-auto"
    on:click={() => {
        if (!terminal) return toast.error('Terminal not initialized');
        const date = new Date().toLocaleTimeString();
        terminal = [{ type: 'warning', message: `${date} Terminal cleared by user!!` }];
    }}>Clear</button
>
<div class="mockup-code {className}" style:height>
    {#if terminal.length > 0}
        <VirtualList height="90%" items={terminal} let:item>
            <pre data-prefix={item.prefix || '>'} class="text-{item.type}"><code
                    class="select-text text-wrap break-words">{item.message}</code
                ></pre>
        </VirtualList>
    {/if}
</div>
