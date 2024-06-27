<script>
    import FooterDownloadStatus from '$lib/utils/footer/Footer_download_status.svelte';
    import FooterLabel from '$lib/utils/footer/Footer_label.svelte';
    import FooterProcess from '$lib/utils/footer/Footer_processes.svelte';
</script>

<div class="footer items-center bg-orange-400 h-[2rem]">
    <aside class="items-center grid-flow-col px-4 w-full">
        <p class="text-black">
            <span>{import.meta.env.VITE_YEAR} &copy; {import.meta.env.VITE_AUTHOUR} |</span>
            <!-- svelte-ignore missing-declaration -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span
                on:click={async () => {
                    await shell.open('https://mcguirelab.mit.edu/index.html');
                }}
            >
                Developed at <span class="underline cursor-pointer">{import.meta.env.VITE_GROUP}</span>
            </span>
        </p>
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
