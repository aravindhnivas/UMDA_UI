<script lang="ts">
    export let name: string;
    export let loading: boolean = false;
    let className = '';
    export { className as class };
</script>

<button disabled={loading} class="btn btn-sm ld-ext-right {className}}" class:running={loading} on:click>
    {name}
    <div class="ld ld-ring ld-spin"></div>
</button>
