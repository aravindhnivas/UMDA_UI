<script lang="ts" generics="T">
    import { pyServerReady } from '$lib/pyserver/stores';

    export let name: string;
    export let callback: (e: MouseEvent) => Promise<T>;
    let className = '';
    export { className as class };

    export let loading: boolean = false;
    export let subprocess = false;
    export let btn: HTMLButtonElement | null = null;
    let process_count = 0;

    const dispatch = createEventDispatcher();

    const run_callback = async (e: MouseEvent) => {
        if (!$pyServerReady) return toast.error('python server is not yet started');
        loading = true;
        if (subprocess) process_count += 1;
        const [err, result] = await oO(callback(e));
        loading = false;
        console.log({ err, result, loading });
        if (subprocess) process_count -= 1;

        if (err) {
            dispatch('error', err);
        } else {
            dispatch('result', result);
        }
        console.log('done!!');
    };
</script>

<!-- <button
    bind:this={btn}
    disabled={loading && !subprocess}
    class="btn btn-sm ld-ext-right w-max {className} "
    class:running={loading}
    on:click={run_callback}
> -->

<button
    bind:this={btn}
    disabled={loading}
    class="btn btn-sm ld-ext-right w-max {className} "
    class:running={loading}
    on:click={run_callback}
>
    {name}
    {#if subprocess && process_count > 0}
        <div class="badge">{process_count}</div>
    {/if}
    <div class="ld ld-ring ld-spin" style="color: antiquewhite;"></div>
</button>
