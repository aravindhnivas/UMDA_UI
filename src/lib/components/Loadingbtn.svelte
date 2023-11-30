<script lang="ts">
    import { sleep } from '$lib/utils/initialise';

    export let name: string;
    export let callback: () => Promise<void> = async () => {};
    let className = '';
    export { className as class };

    let loading: boolean = false;
    // const controller = new AbortController();

    const run_callback = async (e: MouseEvent) => {
        loading = true;

        await callback();
        await sleep(2000);

        loading = false;
    };
</script>

<button disabled={loading} class="btn btn-sm ld-ext-right {className}}" class:running={loading} on:click={run_callback}>
    {name}
    <div class="ld ld-ring ld-spin"></div>
</button>
<!-- {#if loading}
    <button
        class="btn btn-sm btn-error"
        on:click={() => {
            controller.abort();
            loading = false;
        }}>Abort</button
    >
{/if} -->
