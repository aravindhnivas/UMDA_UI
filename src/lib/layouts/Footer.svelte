<script>
    import FooterDownloadStatus from '$lib/utils/footer/Footer_download_status.svelte';
    import FooterLabel from '$lib/utils/footer/Footer_label.svelte';
    import FooterProcess from '$lib/utils/footer/Footer_processes.svelte';
</script>

<div class="footer items-center h-[2rem] shadow-2xl">
    <aside class="grid-flow-col items-center px-4 w-full justify-between">
        <div>
            <span>{import.meta.env.VITE_YEAR} &copy; {import.meta.env.VITE_AUTHOUR} |</span>
            <button
                on:click={async () => {
                    await shell.open('https://mcguirelab.mit.edu/index.html');
                }}
            >
                Developed at <span class="underline cursor-pointer">{import.meta.env.VITE_GROUP}</span>
            </button>
        </div>
        <div class="flex items-center gap-2">
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
