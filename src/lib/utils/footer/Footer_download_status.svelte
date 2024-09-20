<script lang="ts">
    import { CheckCheck } from 'lucide-svelte/icons';
    import { footerMsg } from '$lib/utils/initialise';
</script>

{#if $footerMsg.status !== 'idle'}
    <div class="flex items-center gap-1">
        {#if $footerMsg.status === 'running'}
            <span class="loading loading-spinner"></span>
            <span>{$footerMsg.msg}</span>
        {:else if $footerMsg.status === 'done'}
            <span>Download completed</span>
            <CheckCheck />
        {/if}
    </div>
{/if}
