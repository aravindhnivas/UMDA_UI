<script lang="ts">
    import { CircleX, Info, TriangleAlert, CheckCheck } from 'lucide-svelte/icons';
    export let message: string;
    export let type: 'info' | 'success' | 'warning' | 'error' = 'error';

    let className = '';
    export { className as class };
</script>

{#if type === 'info'}
    <div role="alert" class="alert alert-info p-2 {className}">
        <Info />
        <span>{message}</span>
    </div>
{:else if type === 'success'}
    <div role="alert" class="alert alert-success p-2 {className}">
        <CheckCheck />
        <span>{message}</span>
    </div>
{:else if type === 'warning'}
    <div role="alert" class="alert alert-warning p-2 {className}">
        <TriangleAlert />
        <span>{message}</span>
    </div>
{:else if type === 'error'}
    <div role="alert" class="alert alert-error p-2 {className}">
        <CircleX />
        <span>{message}</span>
    </div>
{/if}
