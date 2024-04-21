<script lang="ts" generics="T">
    export let name: string;
    export let callback: (e: MouseEvent) => Promise<T>;
    let className = '';
    export { className as class };

    export let loading: boolean = false;
    export let subprocess = false;
    let process_count = 0;

    const dispatch = createEventDispatcher();
    const run_callback = async (e: MouseEvent) => {
        loading = true;
        if (subprocess) process_count += 1;
        const [err, result] = await oO(callback(e));
        if (subprocess) process_count -= 1;
        loading = false;

        if (err) {
            dispatch('error', err);
        } else {
            dispatch('result', result);
        }
    };
</script>

<button
    disabled={loading && !subprocess}
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
