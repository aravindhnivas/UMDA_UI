<script>
    import FooterDownloadStatus from '$lib/utils/Footer_download_status.svelte';
</script>

<div class="footer items-center bg-orange-400">
    <aside class="items-center grid-flow-col pl-4 w-full">
        <p class="text-black">Copyright © 2023 - A. N. Marimuthu | MIT Licence</p>

        <FooterDownloadStatus />
    </aside>
</div>

<style>
    .footer {
        overflow: auto;
    }
</style>
