<script lang="ts">
    import { CircleX, Info, TriangleAlert, CheckCheck } from 'lucide-svelte/icons';
    export let message: string;
    export let type: 'info' | 'success' | 'warning' | 'error' = 'error';

    let className = '';
    export { className as class };
</script>

<div role="alert" class="alert alert-{type} p-2 {className}">
    {#if type === 'info'}
        <Info />
    {:else if type === 'success'}
        <CheckCheck />
    {:else if type === 'warning'}
        <TriangleAlert />
    {:else if type === 'error'}
        <CircleX />
    {/if}
    <span>{message}</span>
</div>
