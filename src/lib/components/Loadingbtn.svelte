<script lang="ts" generics="T">
    import { pyServerReady } from '$lib/pyserver/stores';
    import type { CancelTokenSource } from 'axios';
    import { X, Server, Cpu } from 'lucide-svelte/icons';

    export let name: string = 'Compute';

    type Callback = { pyfile: string; args: Record<string, any> } | undefined;
    export let callback: () => Promise<Callback> | Callback;

    let className = '';
    export { className as class };

    export let loading: boolean = false;
    export let subprocess = false;
    export let btn: HTMLButtonElement | undefined = undefined;

    let source: CancelTokenSource;
    let process_count = 0;

    const dispatch = createEventDispatcher();

    const run_callback = async (e: MouseEvent) => {
        try {
            const target = btn ?? (e.currentTarget as HTMLButtonElement);
            if (!target) return toast.error('No target button');

            if (!$pyServerReady) return toast.error('python server is not yet started');

            const data = await callback();
            if (!data) return;
            console.log(data);

            const { pyfile, args } = data;
            const CancelToken = axios.CancelToken;
            source = CancelToken.source();

            loading = true;
            if (subprocess) process_count += 1;

            const dataFromPython = await computePy({
                pyfile,
                args,
                subprocess,
                target: btn ?? (e.currentTarget as HTMLButtonElement),
                cancelToken: source.token,
            });

            // loading = false;
            // if (subprocess) process_count -= 1;

            dispatch('result', { dataFromPython, pyfile, args });
            console.log('done!!');
        } catch (error) {
            toast.error(error as string);
        } finally {
            loading = false;
            if (subprocess) process_count -= 1;
        }
    };
</script>

<div class="flex gap-2 items-center {className}">
    <button on:click={() => (subprocess = !subprocess)}>
        {#if subprocess}
            <Cpu />
        {:else}
            <Server />
        {/if}
    </button>

    <button
        bind:this={btn}
        class:running={loading}
        class:btn-disabled={loading}
        class="btn btn-sm btn-neutral ld-ext-right w-max"
        on:click={run_callback}
        on:pyEvent
        on:pyEventClosed
        on:pyEventStderr
        on:pyEventStdout
        on:pyEventSuccess
    >
        {name}
        {#if subprocess && process_count > 0}
            <div class="badge">{process_count}</div>
        {/if}
        <div class="ld ld-ring ld-spin" style="color: antiquewhite;"></div>
    </button>
    {#if !subprocess && source && loading}
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
