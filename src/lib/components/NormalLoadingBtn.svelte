<script lang="ts">
    export let callback: () => Promise<void> | void;
    export let name: string = 'Compute';

    let loading = false;
    const dispatch = createEventDispatcher();
    const load = async () => {
        try {
            loading = true;
            const data = await callback();
            toast.success('Comutation done successfully');
            dispatch('result', data);
            // return data;
        } catch (error) {
            console.error(error);
            dispatch('error', error);
            toast.error(error as string);
        } finally {
            dispatch('done');
            loading = false;
        }
    };
</script>

<button class="btn btn-sm ld-ext-right" class:running={loading} on:click={load} disabled={loading}>
    {name}
    <div class="ld ld-ring ld-spin" style="color: antiquewhite;"></div>
</button>
