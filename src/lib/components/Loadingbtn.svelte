<script lang="ts" generics="T">
    import { pyServerReady } from '$lib/pyserver/stores';
    import type { CancelTokenSource } from 'axios';
    import { X } from 'lucide-svelte/icons';

    export let name: string;
    // export let callback: (e: MouseEvent) => Promise<T>;
    type Callback = { pyfile: string; args: Record<string, any> } | undefined;
    export let callback: () => Promise<Callback> | Callback;

    let className = '';
    export { className as class };

    export let loading: boolean = false;
    export let subprocess = false;
    export let btn: HTMLButtonElement | null = null;
    // export let source: CancelTokenSource | null = null;

    let source: CancelTokenSource;
    let process_count = 0;

    const dispatch = createEventDispatcher();

    const run_callback = async (e: MouseEvent) => {
        if (!$pyServerReady) return toast.error('python server is not yet started');

        const data = await callback();
        if (!data) return;
        // console.log({ data });

        const { pyfile, args } = data;
        const CancelToken = axios.CancelToken;
        source = CancelToken.source();

        loading = true;
        if (subprocess) process_count += 1;
        // const [err, result] = await oO(callback(e));
        const dataFromPython = await computePy<{ predicted_value: string }>({
            pyfile,
            args,
            general: subprocess,
            target: subprocess ? btn : undefined,
            cancelToken: source.token,
            // target: e.target as HTMLButtonElement,
        });
        loading = false;
        // console.log({ err, result, loading });
        if (subprocess) process_count -= 1;

        dispatch('result', { dataFromPython, pyfile, args });

        // if (!dataFromPython) {
        //     console.log('error!!');
        //     dispatch('error', { pyfile, args });
        // } else {
        //     console.log('result!!');
        //     dispatch('result', { dataFromPython, pyfile, args });
        // }
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

<div class="flex gap-2">
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
    {#if source && loading}
        <button
            class="btn btn-sm btn-error"
            on:click={() => {
                if (!source) return toast.error('No operation to cancel');
                source?.cancel('Operation canceled by the user.');
                toast.error('Operation canceled');
            }}><X /></button
        >
    {/if}
</div>
