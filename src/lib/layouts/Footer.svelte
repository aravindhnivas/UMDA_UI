<script>
    import FooterDownloadStatus from '$lib/utils/footer/Footer_download_status.svelte';
    import FooterLabel from '$lib/utils/footer/Footer_label.svelte';
    import FooterProcess from '$lib/utils/footer/Footer_processes.svelte';
</script>

<div class="footer items-center bg-orange-400 h-[2rem]">
    <aside class="items-center grid-flow-col px-4 w-full">
        <p class="text-black">{import.meta.env.VITE_YEAR} &copy; {import.meta.env.VITE_AUTHOUR} | MIT Licence</p>
        <div class="flex gap-2 ml-auto">
            <FooterLabel />
            <FooterDownloadStatus />
            <FooterProcess />
        </div>
    </aside>
</div>

<style>
    .footer {
        overflow: auto;
    }
</style>
