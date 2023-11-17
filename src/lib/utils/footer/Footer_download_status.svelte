<script lang="ts">
    import { footerMsg } from '$lib/utils/initialise';
    // $footerMsg = {
    //     status: 'done',
    //     msg: 'Installing dependencies',
    // };
</script>

{#if $footerMsg.status !== 'idle'}
    <div class="">
        {#if $footerMsg.status === 'running'}
            <div class="icon-footer">
                <span>{$footerMsg.msg}</span>
                <i class="i-line-md-uploading-loop" />
            </div>
        {/if}

        {#if $footerMsg.status === 'done'}
            <div class="icon-footer">
                <span>Download completed</span>
                <i class="i-material-symbols-download-done-sharp" />
            </div>
        {/if}
    </div>
{/if}

<style global>
    .icon-footer {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }
</style>
