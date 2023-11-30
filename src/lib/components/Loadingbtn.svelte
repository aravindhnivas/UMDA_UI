<script lang="ts">
    export let name: string;
    export let callback: () => Promise<void> = async () => {};
    let className = '';
    export { className as class };

    export let loading: boolean = false;

    const run_callback = async (e: MouseEvent) => {
        loading = true;
        const _result = await oO(callback());
        loading = false;
    };
</script>

<button disabled={loading} class="btn btn-sm ld-ext-right {className}}" class:running={loading} on:click={run_callback}>
    {name}
    <div class="ld ld-ring ld-spin" style="color: antiquewhite;"></div>
</button>
